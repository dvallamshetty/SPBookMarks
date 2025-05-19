import * as React from 'react';
import { useEffect, useState } from 'react';
import { IListDataTableProps } from './IDataTableProps';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const ListDataTable: React.FC<IListDataTableProps> = ({ listId, listService, selectedColumns }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<any>({});
  const [listName, setListName] = useState<string>("");

  // Fetch list name from list ID
  useEffect(() => {
    async function fetchListName() {
      if (listId && listService) {
        const name = await listService.getListTitleById(listId);
        setListName(name);
      } else {
        setListName("");
      }
    }
    fetchListName();
  }, [listId, listService]);

  // Load items
  const loadItems = React.useCallback(() => {
    if (!listId || !selectedColumns || selectedColumns.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    listService.getListItemsById(listId, selectedColumns).then(listItems => {
      setItems(listItems);
      setLoading(false);
    });
  }, [listId, selectedColumns, listService]);

  useEffect(() => {
    if (listId && selectedColumns && selectedColumns.length > 0) {
      loadItems();
    }
  }, [listId, selectedColumns, loadItems]);

  // Delete handler
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      await listService.deleteListItemById(listId, id);
      loadItems();
    }
  };

  // Add Item handlers
  const handleShowAddForm = () => {
    if (selectedColumns && selectedColumns.length > 0) {
      const fieldObj: any = {};
      selectedColumns.forEach(col => {
        if (col !== "Actions" && col !== "Id") fieldObj[col] = "";
      });
      setNewItem(fieldObj);
    }
    setShowAdd(true);
  };

  const handleAddInputChange = (field: string, value: string) => {
    setNewItem((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const itemToAdd: any = { ...newItem };
    delete itemToAdd["Actions"];
    delete itemToAdd["Id"];
    await listService.addListItemById(listId, itemToAdd);
    setShowAdd(false);
    setNewItem({});
    loadItems();
  };

  // Prepare rows and columns for MUI DataGrid
  const rows: GridRowsProp = items.map((item, idx) => ({
    id: item.Id ?? idx,
    ...selectedColumns.reduce((acc, key) => {
      acc[key] = item[key];
      return acc;
    }, {} as Record<string, any>)
  }));

  const columns: GridColDef[] = [
    ...selectedColumns.map(col => ({
      field: col,
      headerName: col,
      flex: 1,
      minWidth: 120,
      editable: false,
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Button
          color="error"
          variant="outlined"
          size="small"
          onClick={() => handleDelete(params.row.Id)}
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <Box>
      <h3>List: {listName || listId}</h3>
      <Button
        variant="contained"
        color="primary"
        onClick={handleShowAddForm}
        sx={{ mb: 2 }}
        disabled={!selectedColumns || selectedColumns.length === 0}
      >
        Add Item
      </Button>
      {showAdd && (
        <Box
          component="form"
          onSubmit={handleAddItem}
          sx={{ mb: 2, background: '#f8f8f8', p: 2, borderRadius: 1 }}
        >
          {Object.keys(newItem).map((field) => (
            <Box key={field} sx={{ mb: 2 }}>
              <label>{field}:</label>
              <input
                required={field === "Title"}
                type="text"
                value={newItem[field]}
                onChange={e => handleAddInputChange(field, e.target.value)}
                style={{ marginLeft: 8, marginBottom: 4 }}
              />
            </Box>
          ))}
          <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
            Add
          </Button>
          <Button type="button" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
        </Box>
      )}
      <div style={{ width: '100%', height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}          
        />
      </div>
    </Box>
  );
};

export default ListDataTable;