import { SPFI, SPFx, spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import { IBookmarkInfo } from "../models/IBookmarkInfo";
import { WebPartContext } from "@microsoft/sp-webpart-base";


export class SharePointService {
    private sp: SPFI;
    private context:WebPartContext;

    constructor(context:WebPartContext) {
        //this.sp = spfi(this.url);
        this.context=context;
        this.sp = spfi().using(SPFx(this.context));
    }

    public async fetchBookmarks(username: string): Promise<IBookmarkInfo[]> {
        try {
            return await this.sp.web.lists.getByTitle("BookMarks").select('Title')();
        } catch (error) {
            console.error('Error getting list info:', error);
            throw error;
        }
    }

    public async deleteBookmark(itemId: number): Promise<void> {
        try {
            await this.sp.web.lists.getByTitle("BookMarks").items.getById(itemId).delete();
            console.log(`Bookmark with ID ${itemId} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting bookmark with ID ${itemId}:`, error);
            throw error;
        }
    }

    public async addBookmark(bookmark: IBookmarkInfo): Promise<void> {
        try {
            await this.sp.web.lists.getByTitle("BookMarks").items.add(bookmark);
            console.log('Bookmark added successfully.');
        } catch (error) {
            console.error('Error adding bookmark:', error);
            throw error;
        }
    }

    public async updateBookmark(itemId: number, updatedData: Partial<IBookmarkInfo>): Promise<void> {
        try {
            await this.sp.web.lists.getByTitle("BookMarks").items.getById(itemId).update(updatedData);
            console.log(`Bookmark with ID ${itemId} updated successfully.`);
        } catch (error) {
            console.error(`Error updating bookmark with ID ${itemId}:`, error);
            throw error;
        }
    }

    public async getCurrentUser(): Promise<any> {
        try {
            const currentUser = await this.sp.web.currentUser();
            console.log('Current user retrieved successfully:', currentUser);
            return currentUser;
        } catch (error) {
            console.error('Error retrieving current user:', error);
            throw error;
        }
    }
}