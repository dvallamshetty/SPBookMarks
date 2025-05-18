import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ListDataTable from './components/DataTable';
import { IListDataTableProps } from './components/IDataTableProps';
import { ListService } from './Services/ListService';

// Import PropertyFieldListPicker and PropertyFieldColumnPicker
import { PropertyFieldListPicker } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldColumnPicker, IPropertyFieldColumnPickerProps } from '@pnp/spfx-property-controls/lib/PropertyFieldColumnPicker';

export interface IListDataTableWebPartProps {
  listId: string;
  selectedColumns: string[]; // Internal names!
}

export default class ListDataTableWebPart extends BaseClientSideWebPart<IListDataTableWebPartProps> {

  private _listService: ListService;

  protected async onInit(): Promise<void> {
    this._listService = new ListService(this.context as WebPartContext);
    return super.onInit();
  }

  public async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {
    if (propertyPath === "listId" && newValue !== oldValue) {
      this.properties.selectedColumns = []; // Reset columns on list change
      this.context.propertyPane.refresh();
    }
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  public render(): void {
    const element: React.ReactElement<IListDataTableProps> = React.createElement(
      ListDataTable,
      {
        listId: this.properties.listId,
        listService: this._listService,
        selectedColumns: this.properties.selectedColumns || []
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Configure your SPFx List DataTable" },
          groups: [
            {
              groupName: "List Settings",
              groupFields: [
                PropertyFieldListPicker('listId', {
                                  label: 'Select a SharePoint List',
                                  selectedList: this.properties.listId,
                                  includeHidden: false,
                                  orderBy: 1,
                                  disabled: false,
                                  onPropertyChange: (propertyPath, oldValue, newValue) => {
                                    this.properties.listId = newValue;
                                    this.properties.selectedColumns = [];
                                  },
                                  properties: this.properties,
                                  context: this.context as WebPartContext,
                                  onGetErrorMessage: null,
                                  deferredValidationTime: 0,
                                  multiSelect: false,
                                  key: 'listPicker'
                                }),
                PropertyFieldColumnPicker('selectedColumns', {
                                  label: "Select columns to display",
                                  selectedColumn: this.properties.selectedColumns,
                                  listId: this.properties.listId,
                                  context: this.context as WebPartContext,
                                  multiSelect: true,
                                  disabled: !this.properties.listId,
                                  columnReturnProperty: "InternalName", // <-- KEY OPTION!
                                  onPropertyChange: (propertyPath, oldValue, newValue) => {
                                    this.properties.selectedColumns = newValue;
                                  },
                                  properties: this.properties,
                                  key: "columnPicker"
                                } as IPropertyFieldColumnPickerProps)
              ]
            }
          ]
        }
      ]
    };
  }
}