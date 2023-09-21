import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries/countries.service';
import { Country, Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegionVar : SmallCountry[] = [];
  public borders : SmallCountry[] = []

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }


  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges // get 1 value from region when change
      .pipe(
        tap(()=> this.myForm.get('country')!.setValue('')),
        tap( () => this.borders = [] ),
        switchMap(region => this.countriesService.countriesByRegion(region))
      )
      .subscribe(countries => {
        this.countriesByRegionVar = countries
        this.countriesByRegionVar.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      })
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges // get 1 value from country when change
      .pipe(
        tap(()=> this.myForm.get('border')!.setValue('')),
        //  filter( (value: string) => value.length > 0 ), //EXAMPLE: WILL RECEIVE : PAN to use it in the next step
         switchMap(alphaCode => this.countriesService.countriesByAlpha(alphaCode)),
         switchMap( country => this.countriesService.getCountryBordersByCodes(country.borders)),
         tap(countries => countries.length > 0 ? this._addValidators('border', Validators.required) : this._removeValidators('border', Validators.required))
      )
      .subscribe(countries => {
        console.log(countries)
        this.borders = countries
        this.borders.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        // if (this.borders.length === 0){
        //  this.myForm.controls['country'].removeValidators(Validators.required)
        //  this.myForm.controls['country'].updateValueAndValidity
        // }
          
        
      })
  }

  private _removeValidators(field: string, validators: ValidatorFn | ValidatorFn[]) {
    this.myForm.controls[field].removeValidators(validators);
    this._updateValueAndValidity(field);
  }
 
  private _addValidators(field: string, validators: ValidatorFn | ValidatorFn[]) {
    this.myForm.controls[field].addValidators(validators);
    this._updateValueAndValidity(field);
  }
 
  private _updateValueAndValidity(field: string) {
    this.myForm.controls[field].updateValueAndValidity();
  }



}
