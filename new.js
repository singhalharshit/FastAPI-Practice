var investorMapping = function () {
    this.instance = undefined;
    this.sandBox = undefined;
    this.tabSchema = {
        tab: [{
            id: "investorMapping",
            name: "Investor Mapping",
            isDefault: true
        }
        ]
    };
}

investorMapping.prototype.init = function (sandBox) {
    let self = this;
    investorMapping.instance = this;
    self.currentSandBox = sandBox;
    self.addDateWidget(sandBox);
    let startDate = self.fromDate._d.format('yyyy-MM-dd')
    let endDate = self.toDate._d.format('yyyy-MM-dd')
    let info = {
        username: iago.user.userName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        asOfDate: moment(startDate).format(iago.isoDateFormat),
        filters: [],
        fromDate: startDate,
        toDate: endDate,
        defaultLoad: 1
    };

    self.getData(info);
    self.addTabsWidget();
}

investorMapping.prototype.addTabsWidget = function () {
    let self = investorMapping.instance;

    $("#myRightMenu").css({
        "display": "block"
    });

    $("#pageHeaderTabPanel").empty();
    $("#pageHeaderTabPanel").tabs({
        tabSchema: self.tabSchema,
        tabContentHolder: "contentBody",
        tabClickHandler: function (selectedTabId, tabContentContainer) {
            //self.handleTabClick(selectedTabId, tabContentContainer);
        }
    });

    self.handleTabClick();
}

investorMapping.prototype.addDateWidget = function (sandBox) {
    let self = investorMapping.instance;
    self.fromDate = moment().subtract(7, 'd');
    self.toDate = moment(new Date())

    sandBox.addWidget({
        elementID: "pageHeaderReportRange",
        widget: 'dateControl',
        widgetInfo: {
            startDate: self.fromDate._d.format('yyyy-MM-dd'),
            endDate: self.toDate._d.format('yyyy-MM-dd'),
            format: 'MMM DD YYYY',
            controlFormat: 'dateRange',
            onChange: function (startDate, endDate) {
                self.fromDate = moment(startDate)
                self.toDate = moment(endDate)
                self.applyFilter();
            }
        },
        enableCache: false
    });
}

investorMapping.prototype.handleTabClick = function (selectedTabId, tabContentContainer) {
    let self = investorMapping.instance;
    self.buildRightFilterObject();
}

investorMapping.prototype.buildRightFilterObject = function () {
    let self = investorMapping.instance;



    let reportDate = self.currentSandBox.getReportDate();
    let dimensionsList = ['Platform_Name', 'Status', 'Fund Name', 'Investor Name', 'Order_Status'];
    let info = {
        username: iago.user.userName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        dimensions: dimensionsList
    };


    self.callRightFilterAPI(info);
}

investorMapping.prototype.callRightFilterAPI = function (queryInfo) {
    let self = investorMapping.instance;


    $.when(
        iago.utils.callService(iago.polarisServiceBaseUrl + '/InvestorMappingService/GetRightFiltersData', queryInfo)).then(function (allRightFilterDimensionData) {
            self.getRightFilterData(allRightFilterDimensionData, 1);
        })

}

investorMapping.prototype.getDimensionData = function (dimensionName, titleName, dimData, allRightFilterDimensionData) {
    let sourceList = new Array();

    if (allRightFilterDimensionData[dimensionName].length > 0) {
        //sourceList.push({
        // "Text": 'Blank',
        // "Value": null,
        // "Checked": true,
        // })
        $.each(allRightFilterDimensionData[dimensionName], function (index, item) {
            sourceList.push({
                "Text": item.name,
                "Value": item.name,
                "Checked": (dimensionName === "Status" & item.name !== "Active") || (dimensionName === "Order_Status" & item.name !== "Finalized") ? false : true,
            })
        });
    }
    let filterData = Array.from(new Set(sourceList.map(data => data.Text))).map(Text => { return sourceList.find(data => data.Text === Text) })
    let filterArr = {
        "eletype": "div",
        "title": titleName,
        "id": dimensionName,
        "type": "iago:checkBox",
        "option-type": "JSON",
        "options": {
            "Type": "checkbox",
            // "Type": "radio",
            "Layout": "default",
            // "RadioValue": portfolioList[0]["Value"],
            "CheckboxInfo": filterData,
            "maxElementToShowAsGrid": 1
        },
        "SelectAll": true,


    }
    dimData.push(filterArr);
    gRightFilterData[dimensionName] = filterData;
}

investorMapping.prototype.getRightFilterData = function (allRightFilterDimensionData, defaultVal) {

    let self = investorMapping.instance;

    //----------------
    gallRightDimensionData = allRightFilterDimensionData;
    //----------------
    let filterData = [];
    self.getDimensionData('Platform_Name', 'Platform Name', filterData, allRightFilterDimensionData)
    self.getDimensionData('Status', 'Status', filterData, allRightFilterDimensionData)
    self.getDimensionData('Fund Name', 'Fund Name', filterData, allRightFilterDimensionData)
    self.getDimensionData('Investor Name', 'Investor Name', filterData, allRightFilterDimensionData)
    self.getDimensionData('Order_Status', 'Order Status', filterData, allRightFilterDimensionData)

    let filterArr = {
        "eletype": "div",
        "title": "Since Inception",
        "id": "Since Inception",
        "type": "iago:checkBox",
        "option-type": "JSON",
        "options": {
            //"Type": "checkbox",
            "Type": "radio",
            "Layout": "default",
            "RadioValue": "False",
            "CheckboxInfo": [{ "Text": "True", "Value": "True" }, { "Text": "False", "Value": "False", "Checked": true }]
        }

    }
    filterData.push(filterArr)

    let rightFilterInfo = {
        "Filters": filterData,
        getData: function (filterInfo) {

            console.log("getdata", filterInfo)
            let defaultLoad = 0;
            self.applyFilter(filterInfo, defaultLoad);
        },
        collapseAllElements: true
    }
    self.currentSandBox.setRightFilter(rightFilterInfo);
    self.bindFiltersChangeEvent();
    self.setCascadingFilters("Fund Status");
    if (defaultVal === 0)
        self.applyFilter();
}

investorMapping.prototype.bindFiltersChangeEvent = function () {
    let self = investorMapping.instance;
    $('div[id="myRightMenu_Platform_Name"]').off('change').on('change', function () {
        self.setCascadingFilters("Platform_Name");
    });
    $('div[id="myRightMenu_Status"]').off('change').on('change', function () {
        self.setCascadingFilters("Fund Status");
    });
    $('div[id="myRightMenu_Fund_Name"]').off('change').on('change', function () {
        self.setCascadingFilters("Fund Name");
    });
    $('div[id="myRightMenu_Investor_Name"]').off('change').on('change', function (obj) {
        self.setCascadingFilters("Investor Name");
    });
    $('div[id="myRightMenu_Account_Owner"]').off('change').on('change', function () {
        self.setCascadingFilters("Account Owner");
    });
}
investorMapping.prototype.applyFilter = function (filter, defaultLoad) {
    let self = investorMapping.instance;
    let startDate = self.fromDate._d.format('yyyy-MM-dd')
    let endDate = self.toDate._d.format('yyyy-MM-dd')
    var rightFilterInfo = self.currentSandBox.getRightFilterData();

    let filterInfo = [];
    $.each(rightFilterInfo, function (key, value) {
        if (key == "Since Inception" && value.SelectedValue == "True") {
            startDate = moment(new Date('01/01/1990'))._d.format('yyyy-MM-dd')
            endDate = moment(new Date())._d.format('yyyy-MM-dd')
        }
        else {
            filterInfo.push({
                key: key,
                value: value.SelectedValue
            });
        }
    });

    let info = {
        username: iago.user.userName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        asOfDate: moment(startDate).format(iago.isoDateFormat),
        filters: filterInfo,
        fromDate: startDate,
        toDate: endDate,
        defaultLoad: defaultLoad == undefined ? 1 : defaultLoad
    };

    self.getData(info);
}

investorMapping.prototype.getData = function (info) {

    let self = investorMapping.instance;

    $.when(
        iago.utils.callService(iago.polarisServiceBaseUrl + '/InvestorMappingService/GetGridData', info)).then(function (data) {

            let gridData = data.Table;
            //gridData=[];
            // let gridInfo = self.gridProperties();
            let gridInfo = iago.utils.commonGridInfo();
            self.setGridProperties(gridInfo)
            self.setEditableColumnsInfo(gridInfo, gridData)
        });
}

investorMapping.prototype.setGridProperties = function (gridInfo) {

    let self = investorMapping.instance;
    gridInfo.ViewKey = "polaris";
    gridInfo.GridId = "gridContainer";
    gridInfo.CurrentPageId = "investorMapping";
    gridInfo.UserId = iago.user.userName;
    gridInfo.AdaptableId = "adaptableId";
    gridInfo.ColumnInfo = [{
        ColumnName: 'Fund Name',
        DataType: 'string'
    }, {
        ColumnName: 'Share Class Name',
        DataType: 'string'
    }, {
        ColumnName: 'Share Class ISIN ID',
        DataType: 'string'
    }, {
        ColumnName: 'Investor Account ID',
        DataType: 'string'
    }, {
        ColumnName: 'Investor Account Name',
        DataType: 'string'
    }, {
        ColumnName: 'Order ID',
        DataType: 'string'
    }, {
        ColumnName: 'Order Lot ID',
        DataType: 'string'
    }, {
        ColumnName: 'Transaction Type',
        DataType: 'string'
    }, {
        ColumnName: 'Order Status',
        DataType: 'string'
    },{
        ColumnName: 'Order Units',
        DataType: 'Number'
    }, {
        ColumnName: 'Order Dealing NAV Date',
        DataType: 'Date'
    },  {
        ColumnName: 'Order Amount',
        DataType: 'Number'
    }, {
        ColumnName: 'Investor Name',
        DataType: 'string'
    }, {
        ColumnName: 'Account Owner',
        DataType: 'string'
    }, {
        ColumnName: 'Region in Salesforce',
        DataType: 'string'
    }, {
        ColumnName: 'Marketing Investor Type',
        DataType: 'string'
    }, {
        ColumnName: 'TA Account Type',
        DataType: 'string'
    }, {
        ColumnName: 'Comment',
        DataType: 'string'
    }, {
		ColumnName: 'Modified By',
		DataType: 'string'
	},
	{
		ColumnName: 'Modified On',
		DataType: 'DateTime'
	},{
        ColumnName: 'Share Class Currency',
        DataType: 'string'
    }
    ];

    gridInfo.ColumnNameMapping = {
        'Fund Name': 'Fund Name 🔒',
        'Share Class ISIN ID': 'ISIN 🔒',
        'Share Class Name': 'Share Class Name 🔒',
        'Share Class Currency': 'Share Class Currency 🔒',
        'Order Status': 'Order Status 🔒',
        'Investor Account ID': 'TA Account Number 🔒',
        'Investor Account Name': 'TA Account Name 🔒',
        'Order ID': 'Transaction Number 🔒',
        'Transaction Type': 'TA Transaction Type 🔒',
        'Order Dealing NAV Date': 'Valuation Point 🔒',
        'Order Units': 'Units 🔒',
        'Order Amount': 'Amount 🔒',
        'Order Lot ID': 'TA Lots ID 🔒',
        'Marketing Investor Type': 'Investor Type',
        'TA Account Type': 'Account Type',
        'Region in Salesforce': 'Region',
        'Modified By': 'Last Modified By 🔒',
        'Modified On': 'Last Modified 🔒'

    }
    gridInfo.AutoGenerateIdColumn = true;
    gridInfo.ColumnNotToExport = [];
    gridInfo.IsBindGrid = true;
    gridInfo.LayoutConnectionKey = "RADDBConnectionId";
    gridInfo.DateFormat = "DD-MMM-YYYY";
    gridInfo.PageSize = 80;
    gridInfo.CheckBoxInfo = "multiple";
    gridInfo.IdColumnName = 'position_key_id';
    gridInfo.RequireRADExcelExport = false;
    gridInfo.ColumnsToHide = ['Share Class Currency'];
    gridInfo.ViewInfoFormatter = [
        { ColumName: "Order Units", DataType: "Number", Negative: "(123456)", Decimal: 2 },
        { ColumName: "Order Amount", DataType: "Number", Negative: "(123456)", Decimal: 2 }

    ]
}

investorMapping.prototype.createInlinefilter = function (data, generalInfo) {

    var id = '#' + generalInfo.divName;
    if ($(id).inlineFilter('instance') != undefined) {
        $(id).inlineFilter('destroy');
    }
    var filteredData = data;

    if (generalInfo.filter === true) {
        filteredData = data.map(function (val, index) {
            return {
                text: val.Text,
                id: val.Value
            }
        })
    }

    $(id).inlineFilter({
        filterInfo: {
            filterPhrase: "{0}",
            bindingInfo: [{
                placeholder: generalInfo.placeholderVal,
                identifier: generalInfo.identifierVal,
                multiple: typeof generalInfo.multiple === "undefined" ? true : generalInfo.multiple,
                defaultValue: generalInfo.defaultValue,
                maxResultsToShow: generalInfo.maxResultsToShow || 2,
                data: filteredData,
                placeholderAlwaysOn: false
            }
            ]
        },
        selectHandler: function (selectedValue, event, filterValueDictionary, selectedIdentifier) {

            let checkedRows = adaptablegridbundle.getCheckedRows('gridContainer');
            let IdentifierStr = "";
            $.each(checkedRows, function (index, row) {
                if (selectedIdentifier == 'investorMapping_DrpDwn_0') {
                    row['Investor Name'] = selectedValue != "" ? selectedValue[0] : null;
                    IdentifierStr = "Investor Name";
                } else if (selectedIdentifier == 'investorMapping_DrpDwn_1') {
                    row['Marketing Investor Type'] = selectedValue != "" ? selectedValue[0] : null;
                    IdentifierStr = "Marketing Investor Type";
                } else if (selectedIdentifier == 'investorMapping_DrpDwn_2') {
                    row['Account Owner'] = selectedValue != "" ? selectedValue[0] : null;
                    IdentifierStr = "Account Owner";
                } else if (selectedIdentifier == 'investorMapping_DrpDwn_3') {
                    row['TA Account Type'] = selectedValue != "" ? selectedValue[0] : null;
                    IdentifierStr = "TA Account Type";
                } else if (selectedIdentifier == 'investorMapping_DrpDwn_4') {
                    row['Region in Salesforce'] = selectedValue != "" ? selectedValue[0] : null;
                    IdentifierStr = "Region in Salesforce";
                }
            })
            if (selectedValue.length > 1) {
                let height = Number($(window).height() - 150);
                let notifyOptions = {
                    type: "danger",
                    offset: {
                        x: 20,
                        y: height
                    },
                    allow_dismiss: false,
                    animate: {
                        enter: 'animated fadeInRight',
                        exit: 'animated fadeOutRight'
                    },
                    delay: 3000
                }
                $.growl("Please Select only one " + IdentifierStr, notifyOptions);
            }
            adaptablegridbundle.updateRow('Update', checkedRows, 'gridContainer')
            $('li.select2-search-choice.multiInlineFilter-select-std').css('color', 'gray');
			$('li.select2-search-choice.multiInlineFilter-select-std').css("width","max-content")
        },
    });
    $('.select2-chosen').css('color', '#424242')
    $('.select2-chosen').css('background-color', '#f2f2f2')
    $('.select2-chosen a,select2-chosen b').css('color', '#535;')
    $('.select2-container').css('width', '100%')
    $('.select2-container').css('padding', '5px 5px 0px 5px')
}

investorMapping.prototype.setEditableColumnsInfo = function (gridInfo, gridData) {
    let self = investorMapping.prototype;
    let editableColumn = new Array();

    let dimensionsList = ['Investor Name', 'Marketing Investor Type', 'Account Owner', 'TA Account Type', 'Region in Salesforce'];
    let info = {
        username: iago.user.userName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        dimensions: dimensionsList
    };
    $.when(
        iago.utils.callService(iago.polarisServiceBaseUrl + '/InvestorMappingService/GetDropDownData', info)).then(function (dimData) {

            $.each(dimensionsList, function (index, dim) {
                let dropDownValues = [];
                if (dimData[dim] != undefined) {
                    dropDownValues.push('Blank')
                    $.each(dimData[dim], function (index, item) {
                        dropDownValues.push(item[dim])
                    });
                }
                let colInfo = {
                    ColumnName: dim,
                    EditableColumnMode: 'DropDown',
                    DropDownValues: dropDownValues,
                }
                editableColumn.push(colInfo)
            });
            let commentInfo = {
                ColumnName: 'Comment',
                // EditableColumnMode: 'DropDown',
                // DropDownValues: dropDownValues,
            }
            editableColumn.push(commentInfo)
            gridInfo.EditableColumnsInfo = editableColumn;
            gridInfo.RaiseGridBeginUpdate = function (gridOps) {
                
                let editableColList = ['Investor Name', 'Marketing Investor Type', 'Account Owner', 'TA Account Type', 'Region in Salesforce'];
                $.each(editableColList, function (index, col) {

                    let colDef = gridOps.gridOptions.columnDefs.find((colDef) => colDef.field === col)
                    colDef.cellEditor = 'agRichSelectCellEditor';
                    //console.log(colDef)

                })
                
                gridOps.predefinedConfig.Dashboard.Tabs[0].Toolbars[0] = 'Export';
                gridOps.predefinedConfig.Dashboard.Tabs[0].Toolbars[1] = 'DataChangeHistory';
                gridOps.predefinedConfig.Dashboard.IsCollapsed = true;
                gridOps.predefinedConfig.Dashboard.Tabs[0].Name = 'Export Report';
            }
            self.bindGridUI(gridInfo, gridData)
            //gridInfo.GridCustomRowFormatData
        })

}
investorMapping.prototype.saveButton = function () {
    $("#" + iago.contentBodyId).addClass("RADUserSpinner");
    let checkedRows = adaptablegridbundle.getCheckedRows('gridContainer')
    let editedRows = adaptablegridbundle.getGridEditData('gridContainer')

    let editDataList = [];
    $.each(editedRows, function (index, row) {
        let editedData = {
            'positionKeyId': row.CellInfo.position_key_id.NewValue,
            'investorName': row.CellInfo['Investor Name'].NewValue == "Blank" ? null : row.CellInfo['Investor Name'].NewValue,
            'marketingInvestorType': row.CellInfo['Marketing Investor Type'].NewValue == "Blank" ? null : row.CellInfo['Marketing Investor Type'].NewValue,
            'accountOwner': row.CellInfo['Account Owner'].NewValue == "Blank" ? null : row.CellInfo['Account Owner'].NewValue,
            'taAccountType': row.CellInfo['TA Account Type'].NewValue == "Blank" ? null : row.CellInfo['TA Account Type'].NewValue,
            'regionInSalesforce': row.CellInfo['Region in Salesforce'].NewValue == "Blank" ? null : row.CellInfo['Region in Salesforce'].NewValue,
            'comment': row.CellInfo['Comment'].NewValue
        }
        editDataList.push(editedData);
    })
    $.each(checkedRows, function (index, row) {
        let editedData = {
            'positionKeyId': row.position_key_id,
            'investorName': row['Investor Name'] == "Blank" ? null : row['Investor Name'],
            'marketingInvestorType': row['Marketing Investor Type'] == "Blank" ? null : row['Marketing Investor Type'],
            'accountOwner': row['Account Owner'] == "Blank" ? null : row['Account Owner'],
            'taAccountType': row['TA Account Type'] == "Blank" ? null : row['TA Account Type'],
            'regionInSalesforce': row['Region in Salesforce'] == "Blank" ? null : row['Region in Salesforce']
        }
        editDataList.push(editedData);
    })

    var uniqueData = [... new Set(editDataList.map(i => i.positionKeyId))].map(id => {
        return {
            "positionKeyId": id,
            "investorName": editDataList.find(i => i.positionKeyId == id).investorName,
            "marketingInvestorType": editDataList.find(i => i.positionKeyId == id).marketingInvestorType,
            "accountOwner": editDataList.find(i => i.positionKeyId == id).accountOwner,
            "taAccountType": editDataList.find(i => i.positionKeyId == id).taAccountType,
            "regionInSalesforce": editDataList.find(i => i.positionKeyId == id).regionInSalesforce,
            "comment": editDataList.find(i => i.positionKeyId == id).comment
        }
    });


    let info = {
        username: iago.user.userName,
        userDisplayName: iago.user.userDisplayName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        editedData: uniqueData
    };
    $.when(
        iago.utils.callService(iago.polarisServiceBaseUrl + '/InvestorMappingService/SaveEditedData', info)).then(function (response) {
            console.log(response);
            let message, notifyType;
            if (response.includes("success")) {
                message = response;
                notifyType = "success"
                $("#" + iago.contentBodyId).removeClass("RADUserSpinner");
                investorMapping.prototype.applyFilter();
                bootbox.hideAll();
            }
            else {
                message = "Error while updating data";
                notifyType = "danger";
            }
            let height = Number($(window).height() - 150);
            let notifyOptions = {
                type: notifyType,
                offset: {
                    x: 20,
                    y: height
                },
                allow_dismiss: false,
                animate: {
                    enter: 'animated fadeInRight',
                    exit: 'animated fadeOutRight'
                },
                delay: 3000
            }
            $.growl(message, notifyOptions);

        })
}

investorMapping.prototype.bindGridUI = function (gridInfo, gridData) {
    if ($('#adaptableId').length > 0) {
        $('#adaptableId').remove();
    }

    if ($('#gridContainer').length > 0) {
        $('#gridContainer').remove();
    }

    let contentBodyHeight = parseInt($('#contentBody').css('height'));
    let $gridContainer = $('<div id="adaptableId"></div><div id= "gridContainer" class= "ag-theme-balham"></div>');
    // $("#gridContainer").css("height", "inherit");

    $("#" + iago.contentBodyId).append($gridContainer);
    iago.utils.bindGrid(gridInfo, gridData)
    $("#gridContainer").css("height", (contentBodyHeight - 40) + "px");

    let dimensionsList = ['Investor Name', 'Marketing Investor Type', 'Account Owner', 'TA Account Type', 'Region in Salesforce'];
    let dropDown = '';
    $.each(dimensionsList, function (index, dim) {
        if ($('#investorMapping_DrpDwn_' + index).length > 0) {
            $('#investorMapping_DrpDwn_' + index).remove();
        }
        // if ($('#investorMapping_Lbl_'+index).length > 0) {
        // $('#investorMapping_Lbl_'+index).remove();
        // }
        dropDown = dropDown + '<div id="investorMapping_DrpDwn_' + index + '" style="min-width: 140px;display: inline-block;padding: 0px 0px 0px 0px;border: ridge;margin: 0px 5px 0px 0px;font-size: 11px;font-weight:bold;max-width: 200px;border-radius: 8px;background-color:#e5e5ed;color:#0000008A";font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;></div>';
    })
    let $dropDownHtml = $(dropDown)
    let $button = $('<input value="Save" type="button" class="btn btn-sm btn-iago-green" id="btnIM" style="background-color:green; color:white;" onclick="javascript:investorMapping.prototype.saveButton();" />');
    $('.pull-left').css('width', '0px')
    $('#pageHeaderTabPanel').css('width', '350px')

    pageHeaderTabPanel
    if ($('#btnIM').length > 0) {
        $('#btnIM').remove();
    }

    $("#pageHeaderCustomDiv").append($dropDownHtml)
    $("#pageHeaderCustomDiv").append($button)
    let privilege = iago.user.privileges.find((privilege) => privilege.PageID === 'imwrite');
    if (privilege === undefined)
        $('#btnIM').prop('disabled', true)
    investorMapping.prototype.createTopDropdowns(dimensionsList);
}

investorMapping.prototype.createTopDropdowns = function (dimensionsList) {
    let info = {
        username: iago.user.userName,
        gridId: 'investorMapping',
        currentPageId: 'investorMapping',
        dimensions: dimensionsList
    };
    investorMapping.prototype.dropDownData = {};
    $.when(
        iago.utils.callService(iago.polarisServiceBaseUrl + '/InvestorMappingService/GetDropDownData', info)).then(function (dimData) {
            let placeholerMappingArr = { "TA Account Type": "Account Type", "Region in Salesforce": "Region", "Account Owner": "Account Owner", "Marketing Investor Type": "Investor Type", "Investor Name": "Investor Name" }
            $.each(dimensionsList, function (index, dim) {
                let dropDownValues = [];
                if (dimData[dim] != undefined) {
                    dropDownValues.push({
                        'Text': 'Blank',
                        'Value': null
                    })
                    $.each(dimData[dim], function (i, item) {
                        dropDownValues.push({
                            'Text': item[dim],
                            'Value': item[dim]
                        })
                    });
                    var hierarchyDefaultValue = dropDownValues[0].Value;
                    var hierarchyData = dropDownValues;
                    investorMapping.prototype.dropDownData[dim] = dropDownValues;
                    var hierarchyFilterInfo = {
                        divName: 'investorMapping_DrpDwn_' + index,
                        placeholderVal: 'Select ' + placeholerMappingArr[dim],
                        identifierVal: 'investorMapping_DrpDwn_' + index,
                        isAddGroup: 'true',
                        // defaultValue: hierarchyDefaultValue,
                        maxResultsToShow: 1,
                        filter: true,
                        multiple: true
                    };
                    investorMapping.prototype.createInlinefilter(hierarchyData, hierarchyFilterInfo);
                }

            });

        })

}

var gallRightDimensionData;
var gRightFilterData = new Array();
investorMapping.prototype.setCascadingFilters = function (changedFilter) {
    console.log($("#" + iago.contentBodyId));

    $("#" + iago.contentBodyId).addClass("RADUserSpinner")
    //location.reload();
    setTimeout(() => {
        let self = investorMapping.instance;
        let dimensions = ["Platform_Name", "Status", "Fund Name", "Investor Name", "Order_Status"];
        let title = ["Platform Name", "Status", "Fund Name", "Investor Name", "Order Status"]
        var filterArr = new Array();
        var filterData = new Array();
        var rightFilterData = self.currentSandBox.getRightFilterData();
        filterArr["Platform_Name"] = rightFilterData["Platform_Name"].CheckboxInfo.filter(data => data.Checked);
        filterArr["Status"] = rightFilterData["Status"].CheckboxInfo.filter(data => data.Checked);

        filterArr["Fund Name"] = changedFilter === 'Fund Name' ? rightFilterData["Fund Name"].CheckboxInfo.filter(data => data.Checked) : gRightFilterData["Fund Name"];
        filterArr["Investor Name"] = changedFilter === 'Investor Name' ? rightFilterData["Investor Name"].CheckboxInfo.filter(data => data.Checked) : gRightFilterData["Investor Name"];
        filterArr["Order_Status"] = gRightFilterData["Order_Status"];

        if (changedFilter == 'Platform_Name' || changedFilter == 'Fund Status')
            investorMapping.prototype.updateCascadingFilters("Fund Name", rightFilterData, filterArr);
        if (changedFilter == 'Platform_Name' || changedFilter == 'Fund Status' || changedFilter == 'Fund Name')
            investorMapping.prototype.updateCascadingFilters("Investor Name", rightFilterData, filterArr);

        self.updateChangedFilterData(changedFilter, rightFilterData, filterArr);
        // console.log($("#" + iago.contentBodyId));

        $.each(dimensions, function (index, item) {
            let filterObj = {
                "eletype": "div",
                "title": title[index],
                "id": item,
                "type": "iago:checkBox",
                "option-type": "JSON",
                "options": {
                    "Type": "checkbox",
                    // "Type": "radio",
                    "Layout": "default",
                    // "RadioValue": portfolioList[0]["Value"],
                    "CheckboxInfo": filterArr[item],
                    "maxElementToShowAsGrid": 0
                },
                "SelectAll": true,

            }
            filterData.push(filterObj);
        })
        let filterObj = {
            "eletype": "div",
            "title": "Since Inception",
            "id": "Since Inception",
            "type": "iago:checkBox",
            "option-type": "JSON",
            "options": {
                //"Type": "checkbox",
                "Type": "radio",
                "Layout": "default",
                "RadioValue": "False",
                "CheckboxInfo": [{ "Text": "True", "Value": "True" }, { "Text": "False", "Value": "False", "Checked": true }]
            }

        }
        filterData.push(filterObj);
        let rightFilterInfo = {
            "Filters": filterData,
            getData: function (filterInfo) {

                console.log("getdata", filterInfo)
                let defaultLoad = 0;
                self.applyFilter(filterInfo, defaultLoad);
            },
            collapseAllElements: false
        }
        self.currentSandBox.setRightFilter(rightFilterInfo);
        self.bindFiltersChangeEvent();
        $("#" + iago.contentBodyId).removeClass("RADUserSpinner");
    }, 1)
    console.log($("#" + iago.contentBodyId));

}

investorMapping.prototype.updateCascadingFilters = function (dimName, rightFilterData, filterArr) {
    if (dimName === 'Fund Name') {
        let fundData1 = new Array();
        let fundData2 = new Array();
        if (gallRightDimensionData[dimName].length > 0 & filterArr["Platform_Name"].length > 0) {
            $.each(filterArr["Platform_Name"], function (index, item) {
                let allRightDimensionData = JSON.parse(JSON.stringify(gallRightDimensionData));
                allRightDimensionData[dimName] = allRightDimensionData[dimName].filter(data => data.Platform_Name == item.Text);
                fundData1 = fundData1.concat(allRightDimensionData[dimName]);
            })
        }
        if (gallRightDimensionData[dimName].length > 0 & filterArr["Status"].length > 0) {
            let allRightDimensionData = JSON.parse(JSON.stringify(gallRightDimensionData));
            allRightDimensionData[dimName] = [];
            $.each(fundData1, function (index, item) {
                let rightDimensionData = JSON.parse(JSON.stringify(gallRightDimensionData));
                allRightDimensionData[dimName] = allRightDimensionData[dimName].concat(rightDimensionData[dimName].filter(data => data.name == item.name));
            })
            $.each(filterArr["Status"], function (index, item) {
                let rightDimensionData = JSON.parse(JSON.stringify(allRightDimensionData));
                rightDimensionData[dimName] = rightDimensionData[dimName].filter(data => data.Status == item.Text);
                fundData2 = fundData2.concat(rightDimensionData[dimName]);
            })
        }
        filterArr["Fund Name"] = gRightFilterData[dimName].filter((data) => fundData2.find(({ name }) => data.Text === name))
    }

    else if (dimName === 'Investor Name') {
        let investorData = new Array();
        if (gallRightDimensionData[dimName].length > 0 & filterArr["Fund Name"].length > 0) {
            $.each(filterArr["Fund Name"], function (index, item) {
                let allRightDimensionData = JSON.parse(JSON.stringify(gallRightDimensionData));
                allRightDimensionData[dimName] = allRightDimensionData[dimName].filter(data => data["Fund Name"] == item.Text);
                investorData = investorData.concat(allRightDimensionData[dimName]);
            })
        }
        filterArr["Investor Name"] = gRightFilterData[dimName].filter((data) => investorData.find(({ name }) => data.Text === name))
    }
}

investorMapping.prototype.updateChangedFilterData = function (changedFilter, rightFilterData, filterArr) {
    filterArr["Platform_Name"] = rightFilterData["Platform_Name"].CheckboxInfo;
    filterArr["Status"] = rightFilterData["Status"].CheckboxInfo;
    filterArr["Fund Name"] = changedFilter === 'Fund Name' ? rightFilterData["Fund Name"].CheckboxInfo : filterArr["Fund Name"];
    filterArr["Investor Name"] = changedFilter === 'Investor Name' ? rightFilterData["Investor Name"].CheckboxInfo : filterArr["Investor Name"];
}
