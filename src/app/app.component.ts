import {
  Component,
  HostListener,
  OnInit,
  WritableSignal,
  signal,
  effect,
} from '@angular/core';
import { RowComponent } from './components/row/row.component';
import { Row } from '../types/row';
import {
  ColumnHoveredEvent,
  ColumnRemovedEvent,
  ObjectMovedEvent,
  ObjectRemovedEvent,
} from '../types/events';
import { StorageService } from './services/storage.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(600, style({ opacity: 1 })),
      ]),
      transition('* => void', [
        style({ opacity: 1 }),
        animate(600, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  public rows: WritableSignal<Row[]> = signal([]);
  public hoveredColumn = signal<string | null>(null);
  public hoveredDropzone = signal<number>(-1);
  public columnDrag = signal(false);

  public columnName = '';

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    const state = this.storageService.getAppState();
    this.rows.set(state);
  }

  public saveState() {
    this.storageService.saveAppState(this.rows());
  }

  @HostListener('document:keydown.Control.v', ['$event'])
  public async clipboard(event: KeyboardEvent) {
    const clipboardContents = await navigator.clipboard.read();
    if (clipboardContents.length == 0) {
      return;
    }
    const item = clipboardContents[0];
    if (!item.types.includes('image/png')) {
      return;
    }

    const blob = await item.getType('image/png');
    const url = URL.createObjectURL(blob);
    this.rows.update((rowState) => {
      rowState[0].objects.push(url);
      return rowState;
    });
    this.saveState();
  }

  public onColumnSubmit() {
    if (this.rows().find((r) => r.label === this.columnName)) {
      this.columnName = '';
      return;
    }

    this.rows.update((rowState) => {
      rowState.unshift({ label: this.columnName, objects: [] });
      return rowState;
    });

    this.columnName = '';
    this.saveState();
  }

  public onColumnHover(event: ColumnHoveredEvent) {
    this.hoveredColumn.set(event.id);
  }

  public onColumnRemoved(event: ColumnRemovedEvent) {
    const columnIndex = this.rows().findIndex(
      (r) => r.label === event.originColumn
    );
    this.rows.update((rowState) => {
      rowState.splice(columnIndex, 1);
      return rowState;
    });
    this.saveState();
  }

  public onObjectRemoved(event: ObjectRemovedEvent) {
    const originColumnIndex = this.rows().findIndex(
      (r) => r.label === event.originColumn
    );
    this.rows.update((rowState) => {
      rowState[originColumnIndex].objects.splice(event.objectIndex, 1);
      return rowState;
    });
    this.saveState();
  }

  public onObjectMoved(event: ObjectMovedEvent) {
    this.hoveredColumn.set(null);
    const originIndex = this.rows().findIndex((r) => r.label === event.origin);
    const targetIndex = this.rows().findIndex((r) => r.label === event.target);
    this.rows.update((rowState) => {
      const object = rowState[originIndex].objects.splice(event.objectIndex, 1);
      if (object.length == 0) return rowState;
      rowState[targetIndex].objects.push(object[0]);
      return rowState;
    });
    this.saveState();
  }

  public onResetClick() {
    this.storageService.resetAppState();
    this.rows.set(StorageService.DEFAULT_STATE);
  }

  public toggleColumnDropzone(value: boolean) {
    this.columnDrag.set(value);
    if (value == false) {
      this.hoveredDropzone.set(-1);
    }
  }

  public onDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('column')) return;
    event.preventDefault();
  }

  public onDrop(event: DragEvent, index: number) {
    const columnIndex = parseInt(event.dataTransfer?.getData('index') || '0');
    this.rows.update((prev) => {
      const columns = prev.splice(columnIndex, 1);
      if (columns.length == 0) return prev;
      prev.splice(index, 0, columns[0]);
      return prev;
    });
    this.toggleColumnDropzone(false);
    this.saveState();
  }

  public onDragEnter(event: DragEvent, index: number) {
    if (!event.dataTransfer?.types.includes('column')) return;
    event.preventDefault();
    this.hoveredDropzone.set(index);
  }
}
