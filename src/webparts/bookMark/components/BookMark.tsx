import * as React from 'react';
import { useState, useEffect } from 'react';
import { TextField, PrimaryButton, List, IIconProps, MessageBar, MessageBarType } from '@fluentui/react';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

const Bookmark: React.FunctionComponent = () => {
  const [bookmarks, setBookmarks] = useState<{ title: string; username: string }[]>([]);
  const [newBookmark, setNewBookmark] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Initialize PnPjs
    /* sp.setup({
      spfxContext: (window as any).spfxContext
    }); */
    const sp = spfi().using(SPFx((window as any).context));
    // Fetch the current user's username
    sp.web.currentUser.get().then(user => {
      setUsername(user.Title);
    });

    // Fetch bookmarks from SharePoint list when the component mounts
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const items = await sp.web.lists.getByTitle('Bookmarks').items.get();
      const bookmarkItems = items.map(item => ({ title: item.Title, username: item.Username }));
      setBookmarks(bookmarkItems);
    } catch (error) {
      setErrorMessage('Error fetching bookmarks: ' + error.message);
    }
  };

  const addBookmark = async () => {
    try {
      await sp.web.lists.getByTitle('Bookmarks').items.add({
        Title: newBookmark,
        Username: username
      });
      setBookmarks([...bookmarks, { title: newBookmark, username }]);
      setNewBookmark('');
    } catch (error) {
      setErrorMessage('Error adding bookmark: ' + error.message);
    }
  };

  const deleteBookmark = async (index: number) => {
    try {
      const items = await sp.web.lists.getByTitle('Bookmarks').items.filter(`Title eq '${bookmarks[index].title}' and Username eq '${bookmarks[index].username}'`).get();
      if (items.length > 0) {
        await sp.web.lists.getByTitle('Bookmarks').items.getById(items[0].Id).delete();
        const updatedBookmarks = bookmarks.filter((bookmark, i) => i !== index);
        setBookmarks(updatedBookmarks);
      }
    } catch (error) {
      setErrorMessage('Error deleting bookmark: ' + error.message);
    }
  };

  const bookmarkIcon: IIconProps = { iconName: 'FavoriteStar' };

  return (
    <div>
      {errorMessage && <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>}
      <TextField
        label="New Bookmark"
        value={newBookmark}
        onChange={(e, newValue) => setNewBookmark(newValue || '')}
      />
      <PrimaryButton
        text="Add Bookmark"
        onClick={addBookmark}
        disabled={!newBookmark}
        iconProps={bookmarkIcon}
      />
      <List
        items={bookmarks}
        onRenderCell={(item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.title} (by {item.username})</span>
            <PrimaryButton text="Delete" onClick={() => deleteBookmark(index)} />
          </div>
        )}
      />
    </div>
  );
};

export default Bookmark;