import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent {
 constructor(private dialogRef: MatDialogRef<DownloadComponent>) {}

  select(type: string) {
    this.dialogRef.close(type);
  }
}
