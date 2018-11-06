import { Component, ViewContainerRef } from '@angular/core';
import { Http, Headers } from '@angular/http';
import * as $ from 'jquery';
import { ToasterService } from 'angular2-toaster';
import {TableModule} from 'primeng/table';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  files: any = [];
  list: any = [];
  radioSelected: any
  width: any;
  isTrue: any;
  id: any;
  selectedFiles: any = [];
  checkedFiles: any = [];
  analyticsData: any = [];
  isCheckBoxClicked: any = false;
  isRadioClicked: any = false;
  disabled: any = true;
  toSearchDate: any;
  constructor(public http: Http, public toasterService: ToasterService) {
    this.analyticsData = this.getDates();
  }

  onChange(data) {
    if (data && data.target && data.target.files && data.target.files.length) {
      var totalFiles = data.target.files;
      for (var i = 0; i < totalFiles.length; i++) {
        this.files.push({ 'id': Math.random(), 'name': totalFiles[i].name, 'size': totalFiles[i].size, 'image': totalFiles[i], 'number': 1 + i });
      }
    }
  }

  getDates() {
    return [{'no':1,'date':'11-1-2018','count':6},
            {'no':1,'date':'11-2-2018','count':22},
            {'no':1,'date':'11-3-2018','count':44},
            {'no':1,'date':'11-4-2018','count':32},
            {'no':1,'date':'10-11-2018','count':6},
            {'no':1,'date':'10-12-2018','count':22},
            {'no':1,'date':'10-13-2018','count':44},
            {'no':1,'date':'10-14-2018','count':32},
            {'no':1,'date':'10-15-2018','count':6},
            {'no':1,'date':'10-16-2018','count':22},
            {'no':1,'date':'10-17-2018','count':44},
            {'no':1,'date':'10-18-2018','count':32},
            {'no':1,'date':'10-19-2018','count':6},
            {'no':1,'date':'10-20-2018','count':22},
            {'no':1,'date':'10-21-2018','count':44},
            {'no':1,'date':'10-22-2018','count':32}
          ];
  }

  
  onSelectDate() {
    this.analyticsData = this.getDates();
    this.toSearchDate = this.toSearchDate.toLocaleDateString("en-US").replace('/','-').replace('/','-');
    if (this.toSearchDate)
      this.analyticsData = this.analyticsData.filter((item) => item.date == this.toSearchDate);
  }  


  uploadFiles(type: any, i: any, selectedFiles) {
    this.id = i;
    var file = '',
      toFindId = '';
    if (selectedFiles && selectedFiles.length && selectedFiles.length > 0) {
      file = selectedFiles[this.id].image;
      toFindId = selectedFiles[this.id].id;
    } else {
      this.toasterService.pop('error', 'Please select files to upload');
      return;
    }
    if (!this.isRadioClicked) {
      this.toasterService.pop('error', 'Please select the primary file');
      return;
    }

    var headers = new Headers();
    for (var k = 0; k < this.files.length; k++) {
      if (this.files[k].isPrimary) {
        if (selectedFiles.indexOf(this.files[k]) > -1) {
          headers.append('primary', this.files[k].name);
          k = this.files.length;
        } else {
          this.toasterService.pop('error', 'Primary file must be a selected file');
          return;
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append('file', file);
    this.http.post('http://localhost:3000/api/uploadFile', formData, { headers: headers })
      .subscribe(response => {
        if (response.json().resultCode === 'OK') {
          var lotNumber = '';
          var headers = new Headers();
          lotNumber = response.json().resultObject[0].lotNumber;
          this.http.post('http://localhost:3000/api/sendLotNumber/'+lotNumber, formData, { headers: headers })
          .subscribe(response => {
             if (response.json().resultCode && response.json().resultCode === 'OK') {
              this.callLoader();
              for (var j = 0; j < this.files.length; j++) {
                if (this.files[j].id === toFindId) {
                  this.files[j].status = 'success';
                }
              }
              var id = this.id + 1;
              if (selectedFiles && selectedFiles.length && selectedFiles.length > 0) {
                if (id < selectedFiles.length) {
                  this.uploadFiles('multiple', id, this.selectedFiles);
                } else {
                  this.selectedFiles = [];
                  this.toasterService.pop('success', 'All files uploaded successfully');
                }
              }
            }
          });
        } else if (response.json().resultCode === 'KO') {
          this.files[this.id].status = 'fail';
          for (var j = 0; j < this.files.length; j++) {
            if (this.files[j].id === toFindId) {
              this.files[j].status = 'fail';
            }
          }
          this.toasterService.pop('error', 'Files uploading has been stopped');
        }
      });
  };


  callLoader() {
    var elem = document.getElementById("bar"),
      width = 1;
    var ids = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(ids);
      } else {
        width++;
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
      }
    };
  }


  onClickRadio(data) {
    this.isRadioClicked = true;
    for (var i = 0; i < this.files.length; i++) {
      if (this.files[i].id === data.id) {
        this.files[i].isPrimary = true;
      }
    }
  }

  onClickCheckBox(file) {
    if (this.selectedFiles.indexOf(file) > -1) {
      this.selectedFiles.splice(file, 1);
    } else {
      this.selectedFiles.push(file);
    }
  }

  cancel() {
    this.files = [];
  }

  manageActions(id, type) {
    if (type === 'delete') {
      this.files = this.files.filter((item) => item.id !== id);
    } 
  }


  uploadAllFiles() {
    this.uploadFiles('multiple', 0, this.selectedFiles);
  }

  closeModal() {
    this.analyticsData = this.getDates();
    this.toSearchDate = '';
  }

  uploadRefFile(data) {
    if (data && data.target && data.target.files && data.target.files.length && data.target.files.length > 0) {
      var refFile = data.target.files;
      if (refFile) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    }
    
  }
  
  addColorsToActiveTabs(tabId) {
    var tabsArr = ['ocr-tab','ml-tab','file-tab'],
    index = tabsArr.indexOf(tabId);
    tabsArr.splice(index,1);
    $('.'+tabId).addClass('tabBgColor');
    for (var i = 0;i< tabsArr.length;i++) {
      $('.'+tabsArr[i]).removeClass('tabBgColor');
    }
  }
}

