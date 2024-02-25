import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  WritableSignal,
  signal,
} from '@angular/core';
import { Row } from '../../../types/row';
import {
  ColumnHoveredEvent,
  ColumnRemovedEvent,
  ObjectMovedEvent,
  ObjectRemovedEvent,
} from '../../../types/events';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { typArrowMove, typTrash } from '@ng-icons/typicons';

@Component({
  selector: 'app-row',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './row.component.html',
  styleUrl: './row.component.scss',
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 })),
      ]),
    ]),
  ],
  viewProviders: [provideIcons({ typTrash, typArrowMove })],
})
export class RowComponent {
  @Input({ required: true }) row: Row = {} as Row;
  @Input({ required: true }) columnIndex = 0;
  @Input() hovered: boolean = false;

  @Output() objectMoved = new EventEmitter<ObjectMovedEvent>();
  @Output() objectRemoved = new EventEmitter<ObjectRemovedEvent>();
  @Output() columnHovered = new EventEmitter<ColumnHoveredEvent>();
  @Output() columnRemoved = new EventEmitter<ColumnRemovedEvent>();
  @Output() columnMoveToggle = new EventEmitter();

  public hoverIndex: WritableSignal<number | null> = signal(null);

  public onColumnDrag() {
    this.columnMoveToggle.emit(true);
  }

  public onColumnDragStart(event: DragEvent) {
    event.dataTransfer?.setData('index', this.columnIndex.toString());
    event.dataTransfer?.setData('column', 'column');
  }

  public onColumnDragEnd(event: DragEvent) {
    this.columnMoveToggle.emit(false);
  }

  public onDragStart(event: DragEvent, id: string, index: number) {
    event.dataTransfer?.setData('origin', id);
    event.dataTransfer?.setData('index', index.toString());
    event.dataTransfer?.setData('object', 'object');
    event.dataTransfer?.setData(id.toLocaleLowerCase(), 'originId');
  }

  public onDragEnd() {
    this.columnHovered.emit({ id: '' });
  }

  public onDrop(event: DragEvent, id: string) {
    event.preventDefault();
    this.objectMoved.emit({
      objectIndex: parseInt(event.dataTransfer?.getData('index') || '0'),
      origin: event.dataTransfer?.getData('origin') || '',
      target: id,
    });
  }

  public onDragOver(event: DragEvent, id: string) {
    if (
      event.dataTransfer?.types.includes(id.toLocaleLowerCase()) ||
      !event.dataTransfer?.types.includes('object')
    )
      return;
    event.preventDefault();
  }

  public onDragEnter(event: DragEvent, id: string) {
    if (
      event.dataTransfer?.types.includes(id.toLocaleLowerCase()) ||
      !event.dataTransfer?.types.includes('object')
    )
      return;
    event.preventDefault();
    this.columnHovered.emit({ id: id });
  }

  public onRemoveColumnClick(id: string) {
    this.columnRemoved.emit({ originColumn: id });
  }

  public onRemoveClick(id: string, index: number) {
    this.objectRemoved.emit({ objectIndex: index, originColumn: id });
  }

  public onMouseEnterHead() {
    this.hoverIndex.set(-1);
  }

  public onMouseEnter(index: number) {
    this.hoverIndex.set(index);
  }

  public onMouseLeave() {
    this.hoverIndex.set(null);
  }
}
