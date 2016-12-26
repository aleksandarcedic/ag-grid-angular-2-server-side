import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid/main';
import { Observable } from 'rxjs';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';

interface IServerResponse {
  data: string[];
  totalElements: number;
  pageSize: number;
  totalPages: number;
  pageNumber: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  quickFilter: string;
  showGrid: boolean = true;

  columnDefs = [
    { headerName: "Id", field: "id", width: 200, filter: 'number' , filterParams: { newRowsAction: 'keep' }},
    { headerName: "First name", field: "first_name", width: 200, filter: 'text', filterParams: { newRowsAction: 'keep' } },
    { headerName: "Last name", field: "last_name", width: 200, filter: 'text', filterParams: { newRowsAction: 'keep' } }
  ]
  listData = [];
  title = 'app works!';
  p: number = 1;
  errorMessage: string;
  defaultSizePerPage = 5;
  gridOptions: GridOptions = {
    paginationPageSize: this.defaultSizePerPage,
  };


  constructor(private http: Http) { }
  dataSource = {



    getRows: (params: any) => {

      console.log(params);
      console.log("defaultSizePerPage " + this.gridOptions.paginationPageSize);
      console.log("quickFilter=" + this.quickFilter);
      console.log("page=" + (params.endRow / this.gridOptions.paginationPageSize));
      var sortString;

      var sortState = this.gridOptions.api.getSortModel();
      if (sortState.length !== 0) {
        console.log(sortState[0]);
        sortString = sortState[0].colId + "," + sortState[0].sort;
      }

      if(this.quickFilter){
        var useQuickFilter = this.quickFilter;
      }

      var filterState = this.gridOptions.api.getFilterModel();
      var filterSend = [];
 for (var k in filterState){
    if (filterState.hasOwnProperty(k)) {
         filterSend.push({column:k,filter:filterState[k].filter, type:filterState[k].type});
    }
}
console.log(JSON.stringify( filterSend ));






      var getPage = params.endRow / this.gridOptions.paginationPageSize;
      this.serverCall(this.gridOptions.paginationPageSize, getPage, sortString, useQuickFilter,filterSend ).subscribe(
        result => {


          var rowsThisPage = result.data;

          var lastRow = result.totalElements;

          params.successCallback(rowsThisPage, lastRow);
        },
        error => this.errorMessage = <any>error);



    }
  }


  ngOnInit() {
    this.gridOptions.datasource = this.dataSource;
  }




  serverCall(rowsPerPage: number, page: number, sort?: string, quickFilter?: string, filterPerColumn?: Array<any>): Observable<IServerResponse> {

    let params: URLSearchParams = new URLSearchParams();
    params.set('page', page.toString());
    params.set('size', rowsPerPage.toString());

    if (sort) {
      params.set('sort', sort);
    }

    if(quickFilter){
      params.set('quickFilter',quickFilter);
    }

    if(filterPerColumn.length>0){
      params.set('filterPerColumn', JSON.stringify( filterPerColumn ));
    }

    return this.http.get("http://localhost/blog/pag2.php", { search: params })
      .map((response: Response) => response.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }











  onChange(rowsPerPage) {

    this.gridOptions.paginationPageSize = parseInt(rowsPerPage);

    this.gridOptions.api.setDatasource(this.dataSource);

  }
  private onRowClicked($event) {
    console.log('onRowClicked: ' + $event.node.data.userNumber);
  }
  private onBeforeFilterChanged() {
    console.log('beforeFilterChanged');
  }
  private onAfterFilterChanged() {
    console.log('afterFilterChanged');
  }
  private onFilterModified() {
    console.log('onFilterModified');
  }
  public onQuickFilterChanged($event) {
    this.quickFilter = $event.target.value;
    this.gridOptions.api.setQuickFilter($event.target.value);
  }
}
