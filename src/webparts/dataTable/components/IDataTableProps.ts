import { ListService } from '../Services/ListService'

export interface IListDataTableProps {
  listId: string;
  listService: ListService;
  selectedColumns: string[];
}