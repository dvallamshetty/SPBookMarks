import * as React from 'react';
import { useEffect, useState } from 'react';
import { IListDataTableProps } from './IDataTableProps';
import DataTable, { TableColumn } from 'react-data-table-component';

const ListDataTable: React.FC<IListDataTableProps> = ({ listId, listService, selectedColumns }) => {
  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<TableColumn<any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<any>({});

  // Load items
  const loadItems = React.useCallback(() => {
    if (!listId || !selectedColumns || selectedColumns.length === 0) {
      setItems([]);
      setColumns([]);
      return;
    }
    setLoading(true);
    listService.getListItemsById(listId, selectedColumns).then(listItems => {
      setItems(listItems);
      setLoading(false);
    });
  }, [listId, selectedColumns, listService]);

  // Set columns based on selectedColumns
  useEffect(() => {
    if (selectedColumns && selectedColumns.length > 0) {
      const cols: TableColumn<any>[] = selectedColumns.map((key) => ({
        name: key,
        selector: (row: any) => row[key],
        sortable: true,
        wrap: true,
      }));
      // Actions column
      cols.push({
        name: "Actions",
        cell: (row: any) => (
          <button onClick={() => handleDelete(row.Id)} style={{ color: 'red' }}>
            Delete
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      });
      setColumns(cols);
    } else {
      setColumns([]);
    }
    // eslint-disable-next-line
  }, [selectedColumns]);

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

  return (
    <div>
      <h3>List: {listId}</h3>
      <button onClick={handleShowAddForm} style={{ marginBottom: 8 }} disabled={!selectedColumns || selectedColumns.length === 0}>Add Item</button>
      {showAdd && (
        <form onSubmit={handleAddItem} style={{ marginBottom: 12, background: '#f8f8f8', padding: 12 }}>
          {Object.keys(newItem).map((field) => (
            <div key={field}>
              <label>{field}:</label>
              <input
                required={field === "Title"}
                type="text"
                value={newItem[field]}
                onChange={e => handleAddInputChange(field, e.target.value)}
                style={{ marginLeft: 8, marginBottom: 4 }}
              />
            </div>
          ))}
          <button type="submit" style={{ marginRight: 8 }}>Add</button>
          <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
        </form>
      )}
      <DataTable
        columns={columns}
        data={items}
        pagination
        highlightOnHover
        dense
        responsive
        striped
        progressPending={loading}
        noDataComponent="No items found."
      />
    </div>
  );
};

export default ListDataTable;