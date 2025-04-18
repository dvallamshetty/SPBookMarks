import * as React from 'react';
import { TextField, PrimaryButton, List, IIconProps, MessageBar, MessageBarType } from '@fluentui/react';
import { SharePointService } from '../../../services/SharePointService';
import { IBookMarkProps } from './IBookMarkProps';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IBookmarkInfo } from '../../../models/IBookmarkInfo';

interface BookmarkState {
  bookmarks: IBookmarkInfo[];
  newBookmark: string;
  errorMessage: string;
  username: string;
  context:WebPartContext;
  sharePointService: SharePointService | undefined;
}

class Bookmark extends React.Component<IBookMarkProps, BookmarkState> {
  constructor(props: IBookMarkProps) {
    super(props);
    this.state = {
      bookmarks: [],
      newBookmark: '',
      errorMessage: '',
      username: '',
      context:this.props.context,
      sharePointService: undefined,
    };
  }

  componentDidMount() {
    // Initialize SharePointService
    const service = new SharePointService(this.context);
    this.setState({ sharePointService: service });
  }

  fetchCurrentUser = async (): Promise<void> => {
    const { sharePointService } = this.state;
    if (!sharePointService) return;

    try {
      const user = await sharePointService.getCurrentUser();
      this.setState({ username: user.LoginName });
    } catch (error: any) {
      this.setState({ errorMessage: 'Error fetching current user: ' + error.message });
    }
  };

  fetchBookmarks = async (): Promise<void> => {
    const { sharePointService, username } = this.state;
    if (!sharePointService) return;

    try {
      const items = await sharePointService.fetchBookmarks(username);
      this.setState({ bookmarks: items });
    } catch (error: any) {
      this.setState({ errorMessage: 'Error fetching bookmarks: ' + error.message });
    }
  };

  addBookmark = async (Title: string, Url: string, Username: string): Promise<void> => {
    const { sharePointService, bookmarks } = this.state;
    if (!sharePointService) return;

    try {
      const bookmark: IBookmarkInfo = { Title, Url, UserName: Username };
      await sharePointService.addBookmark(bookmark);
      this.setState({
        bookmarks: [...bookmarks, bookmark],
        newBookmark: '',
      });
    } catch (error: any) {
      this.setState({ errorMessage: 'Error adding bookmark: ' + error.message });
    }
  };

  deleteBookmark = async (index: number): Promise<void> => {
    const { sharePointService, bookmarks } = this.state;
    if (!sharePointService) return;

    try {
      const itemId = bookmarks[index].Id; // Assuming `Id` is part of `IBookmarkInfo`
      if (itemId !== undefined) {
        await sharePointService.deleteBookmark(itemId);
      } else {
        this.setState({ errorMessage: 'Error deleting bookmark: Invalid bookmark ID' });
      }
      const updatedBookmarks = bookmarks.filter((_, i) => i !== index);
      this.setState({ bookmarks: updatedBookmarks });
    } catch (error: any) {
      this.setState({ errorMessage: 'Error deleting bookmark: ' + error.message });
    }
  };

  public render(): React.ReactElement<BookmarkState> {
    const { bookmarks, newBookmark, errorMessage } = this.state;
    const bookmarkIcon: IIconProps = { iconName: 'FavoriteStar' };

    return (
      <div>
        {errorMessage && <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>}
        <TextField
          label="New Bookmark"
          value={newBookmark}
          onChange={(e, newValue) => this.setState({ newBookmark: newValue || '' })}
        />
        <PrimaryButton
          text="Add Bookmark"
          onClick={() => this.addBookmark(newBookmark, 'https://example.com', this.state.username)}
          disabled={!newBookmark}
          iconProps={bookmarkIcon}
        />
        <List
          items={bookmarks}
          onRenderCell={(item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {item && <span>{item.Title} (by {item.UserName})</span>}
              {index !== undefined && (
                <PrimaryButton text="Delete" onClick={() => this.deleteBookmark(index)} />
              )}
            </div>
          )}
        />
      </div>
    );
  }
}

export default Bookmark;