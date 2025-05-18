import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/presets/all';
import { WebPartContext } from "@microsoft/sp-webpart-base";

export class ListService {
  private sp: SPFI;

  constructor(context: WebPartContext) {
    this.sp = spfi().using(SPFx(context));
  }

  // Get items by list GUID and selected fields
  public async getListItemsById(listId: string, selectedColumns: string[]): Promise<any[]> {
    if (!listId) return [];
    try {
      let query = this.sp.web.lists.getById(listId).items;
      if (selectedColumns && selectedColumns.length > 0) {
        query = query.select(...selectedColumns, "Id");
      }
      const items = await query();
      return items;
    } catch (err) {
      console.error("Error fetching list items: ", err);
      return [];
    }
  }

  public async deleteListItemById(listId: string, id: number): Promise<void> {
    try {
      await this.sp.web.lists.getById(listId).items.getById(id).delete();
    } catch (err) {
      console.error("Error deleting list item: ", err);
    }
  }

  public async addListItemById(listId: string, item: any): Promise<void> {
    try {
      await this.sp.web.lists.getById(listId).items.add(item);
    } catch (err) {
      console.error("Error adding list item: ", err);
    }
  }

  // Legacy, not needed with PropertyFieldListPicker/ColumnPicker, kept for completeness
  public async getAvailableLists(): Promise<{ Title: string, Id: string }[]> {
    try {
      const lists = await this.sp.web.lists
        .filter("BaseTemplate eq 100 and Hidden eq false")
        .select("Title", "Id")();
      return lists;
    } catch (err) {
      console.error("Error loading available lists: ", err);
      return [];
    }
  }
}