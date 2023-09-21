import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {



  private baseUrl: string = 'https://restcountries.com/v3.1'

  private _regions: Region[] =
    [Region.Africa,
    Region.America,
    Region.Asia,
    Region.Europe,
    Region.Oceania]

  constructor(private http: HttpClient) { }

  get regions(): Region[] {
    return [...this._regions]
  }

  countriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([])

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`

    return this.http.get<Country[]>(url)
      .pipe(
        map(contries => contries.map(country => ({

          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      )
  }

  countriesByAlpha(alphaCode: string): Observable<SmallCountry> {
    const url: string = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`

    if (!alphaCode) return of()

    return this.http.get<Country>(url)
      .pipe(
        map(country => ({

          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        })),

      )
  }
  
  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]>{
    if (!borders || borders.length === 0) return of([])

    const countriesRequests: Observable<SmallCountry>[] = []

    borders.forEach( code => {
      const request = this.countriesByAlpha(code)
      countriesRequests.push(request)
    })
    return combineLatest(countriesRequests)
  }
}
