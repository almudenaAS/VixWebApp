import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError, catchError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  private apiUrl = 'http://localhost:3000/areas';  // Reemplaza con la URL de tu backend

  constructor(private http: HttpClient) { }

  saveArea(area: any): Observable<any> {
    return this.http.post(this.apiUrl, area);
  }

  getAreas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteArea(areaId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${areaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }


}
