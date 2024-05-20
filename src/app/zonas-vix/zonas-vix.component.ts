import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { AreaService } from '../area.service';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';



interface Area {
  id: string;
  name: string;
  points: { x: number, y: number }[];
  color: string;
  pointsnorm: { x: number, y: number }[];
  analytic: string;
}


@Component({
  selector: 'app-zonas-vix',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `

  <section class='form-images '>
    <canvas #canvas id="Canvas"  width="1920/2" height="1080/2"></canvas>
  </section>

  <section class="form-buttons-container">
    <button class="btn btn-primary" (click)="NewArea()">Create New Area</button>
    <div *ngIf="formVisible" class="form-container">
      <form (ngSubmit)="onSubmit()">
        <label for="color">Color:</label>
        <input type="color" id="color" name="color" value="#ff0000" (input)="setColor($event)">
        <div class="form-group">
          <label for="areaId">ID Area</label>
          <input type="text" id="areaId" [(ngModel)]="areaId" name="areaId" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="areaName">Name Area</label>
          <input type="text" id="areaName" [(ngModel)]="areaName" name="areaName" class="form-control" required>
        </div>
        <button class="btn btn-primary" (click)="toggleDropdown()">Analysis Options</button>
        <div *ngIf="dropdownVisible" class="dropdown">
          <select [(ngModel)]="selectedOption" (change)="saveOption()">
            <option value="option1">Bird Analytic</option>
            <option value="option2">Person Count</option>
            <option value="option3">Option 3</option>
            <!-- Agrega más opciones según sea necesario -->
          </select>
        </div>
        <button class="btn btn-primary" (click)="SaveArea()">Save Area</button>
        <button class="btn btn-primary" (click)="CleanArea()">Clean Points</button>
      </form>
    </div>
  </section>


  <section class="results">
    <div class="form-group">
      <label for="searchAreaId" class="search-label">Serach Area by ID:</label>
      <div class="input-group">
        <input type="text" id="searchAreaId" [(ngModel)]="searchAreaId" name="searchAreaId" class="form-control">
        <button class="btn btn-primary search-icon" (click)="showAreaInfo(searchAreaId)"></button>
      </div>
    </div>
    <div *ngIf="selectedArea" class="area-info">
      <h2>Area Information</h2>
      <p>ID: {{ selectedArea.id }}</p>
      <p>Name: {{ selectedArea.name }}</p>
      <p>Analytic: {{ selectedArea.analytic }}</p>
      <button class="btn btn-danger" (click)="deleteArea(selectedArea.id)">Delete Area</button> <!-- Botón de eliminar área -->
    </div>
  </section>

  <section>
    <button class="botones-areas" (click)="deleteAllAreas()">Delete All Areas</button>
  </section>
  `,
  styleUrl: './zonas-vix.component.css'
})
export class ZonasVixComponent implements OnInit, AfterViewInit {

  constructor(private areaService: AreaService) {}
  areasSubscription: Subscription;

  //Imagen Canvas
  @ViewChild('canvas') canvas: any;
  context: CanvasRenderingContext2D;
  mapSprite: HTMLImageElement;
  points: { x: number, y: number }[] = [];
  drawingPolygon: boolean = false;
  selectedColor: string = '#ff0000';
  formVisible = false;
  newArea = false;
  areaId = '';
  areaName = '';
  savedAreas: any[] = []; // Lista de áreas guardadas

  setColor(event: any) {
    const color = event?.target?.value;
    if (color) {
      this.selectedColor = color;
    }
  }

  loadAreasFromDatabase() {
    this.areasSubscription = this.areaService.getAreas().subscribe(areas => {
      // Dibuja las áreas recuperadas en el canvas
      areas.forEach(area => {
        this.savedAreas.push(area);
        this.drawSavedArea(area);
      });
    }, error => {
      console.error('Error al cargar las áreas:', error);
    });
  }

  drawSavedArea(area: any): void {
    this.context.beginPath();
    this.context.moveTo(area.points[0].x, area.points[0].y);
    this.context.strokeStyle = area.color;
    for (let i = 1; i < area.points.length; i++) {
      this.context.lineTo(area.points[i].x, area.points[i].y);
    }

    this.context.fillStyle = this.hexToRGBA(area.color, 0.4);
    this.context.fill();
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();

    const middleIndex = Math.floor(area.points.length / 2);
    const middlePointX = (area.points[middleIndex].x + area.points[middleIndex + 1].x) / 2;
    const middlePointY = (area.points[middleIndex].y + area.points[middleIndex + 1].y) / 2;

    // Dibujar el recuadro del ID
    this.context.fillStyle = 'white';
    this.context.fillRect(middlePointX - 20, middlePointY - 10, 40, 20);

    // Escribir el ID del área dentro del recuadro
    this.context.font = '10px Arial';
    this.context.fillStyle = 'black';
    this.context.textAlign = 'center';
    this.context.fillText(`ID: ${area.id}`, middlePointX, middlePointY + 5);

  }

  ngOnInit(): void {
    this.mapSprite = new Image();
    this.mapSprite.onload = () => {
      this.canvas.nativeElement.width = this.mapSprite.width/2;
      this.canvas.nativeElement.height = this.mapSprite.height/2;
      this.context.drawImage(this.mapSprite, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.loadAreasFromDatabase();
    };
    this.mapSprite.src = "/assets/100.jpg";
    
  }

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext("2d");
    this.context.strokeStyle = this.selectedColor;
    this.context.lineWidth = 2;
  }

  NewArea() {
    this.formVisible = !this.formVisible;
    this.newArea = !this.newArea;

    if (this.newArea) {
      this.canvas.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.canvas.nativeElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    } else {
      this.canvas.nativeElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
      this.canvas.nativeElement.removeEventListener('mouseup', this.onMouseUp.bind(this));
      this.points = [];
      this.draw();
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (this.newArea==true){
      this.drawingPolygon = true;
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.points.push({ x, y });
      this.draw();}
  }

  onMouseUp(): void {
    if (this.drawingPolygon) {
      this.context.strokeStyle = this.selectedColor;
      this.drawingPolygon = false;
      this.draw();
    }
  }

  draw(): void {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context.drawImage(this.mapSprite, 0, 0, this.mapSprite.width/2, this.mapSprite.height/2);
    
    this.areasSubscription = this.areaService.getAreas().subscribe(areas => {
      areas.forEach(area => {
        this.drawSavedArea(area);
      });
    }, error => {
      console.error('Error al cargar las áreas:', error);
    });

    this.drawPoints();
    if (this.points.length > 1) {
      this.context.strokeStyle = this.selectedColor;
      this.drawPolygon();
    }
  }

  drawPoints(): void {
    this.points.forEach(point => {
      this.context.beginPath();
      this.context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      this.context.fillStyle = this.selectedColor;
      this.context.fill();
    });
  }

  drawPolygon(): void {
    this.context.beginPath();
    this.context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.context.lineTo(this.points[i].x, this.points[i].y);
    }
    if (this.drawingPolygon) {
      this.context.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
    }
    this.context.fillStyle = this.hexToRGBA(this.selectedColor, 0.4);
    this.context.fill();
    this.context.strokeStyle = this.selectedColor;
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }

  hexToRGBA(hex: string, opacity: number): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  onSubmit() {
    if (this.areaId && this.areaName && this.points.length > 1) {
      console.log(`Área creada: ID = ${this.areaId}, Nombre = ${this.areaName}`);
            
      // Restablecer los campos y los puntos
      this.areaId = '';
      this.areaName = '';
      this.formVisible = false;
      this.newArea = false;
      this.points = [];
      this.draw();
    } else {
      console.log("Completa todos los campos y dibuja al menos dos puntos para crear un área.");
    }
  }
  
  SaveArea() {
    const normalizedPoints = this.points.map(point => {
      const normalizedX = point.x / (this.mapSprite.width/2);
      const normalizedY = point.y / (this.mapSprite.height/2);
      return { x: normalizedX, y: normalizedY };
    });

    const area = {
      id: this.areaId,
      name: this.areaName,
      points: this.points,
      color: this.selectedColor,
      pointsnorm: normalizedPoints,
      analytic: this.AnaliticOption
    };

    this.areaService.saveArea(area).subscribe(response => {
      console.log('Área guardada:', response);
      this.savedAreas.push(area); // Agrega el área guardada a la lista
      this.drawSavedArea(area); // Dibuja el área guardada en el canvas
      
      // Desactivar el modo de creación de área
      this.newArea = false;
      this.formVisible = false;
      this.points = [];
    }, error => {
      console.error('Error al guardar el área:', error);
    }); 
  }

  CleanArea(){
    this.points = [];
    this.draw();
  }

  searchAreaId: string = '';
  selectedArea: any = null;
  showAreaInfo(areaId: string) {
    this.selectedArea = this.savedAreas.find(area => area.id === areaId);
  }

  deleteArea(areaId: string) {
    // Encuentra el área con el ID proporcionado
    const areaToDelete = this.savedAreas.find(area => area.id === areaId);
    if (!areaToDelete) {
      console.error('Área no encontrada con el ID:', areaId);
      return;
    }
    // Llama a la función handleDeleteArea con el área encontrada
    this.areaService.deleteArea(areaToDelete.id).subscribe(response => {
      console.log('Área eliminada:', response);
      this.savedAreas = this.savedAreas.filter(savedArea => savedArea.id !== areaToDelete.id);
      this.selectedArea = null;
      this.draw();
    }, error => {
      console.error('Error al eliminar el área:', error);
    });
  }

  deleteAllAreas() {
    const deleteObservables = this.savedAreas
      .filter(area => area.id)  // Filtrar áreas sin ID
      .map(area => this.areaService.deleteArea(area.id));
    
    forkJoin(deleteObservables).subscribe(response => {
        console.log('Todas las áreas eliminadas:', response);
        this.savedAreas = []; // Vaciar la lista de áreas guardadas
        this.selectedArea = null; // Limpiar el área seleccionada
        this.draw(); // Redibujar el canvas
      },
      error => {
        console.error('Error al eliminar una o más áreas:', error);
      }
    );
    this.savedAreas = []; // Vaciar la lista de áreas guardadas
    this.selectedArea = null; // Limpiar el área seleccionada
    this.draw(); // Redibujar el canvas
  }


  dropdownVisible: boolean = false;
  selectedOption: string;
  AnaliticOption: string = '';
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  saveOption() {
    this.AnaliticOption = this.selectedOption;
    console.log('Option selected:', this.selectedOption);
  }

}
