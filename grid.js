CashMBlotterFactory.prototype.BindGrid = function (isRefresh, checkIsChanged, sandBox) {
    isRefresh = false;
    if (!CashMBlotterFactory.prototype.currentBlotter.PostGridInfo || (isRefresh && $("#RADXLGridBlotter").length==0))
        return;
    if (CashMBlotterFactory.prototype.TimeSpan != 0) {
        $("#blotterTimerdiv").html(CashMBlotterFactory.prototype.TimeSpan);
        CashMBlotterFactory.prototype.createTimeSpan();
    }
    var showLoading = true;
    CashMBlotterFactory.prototype.PreviousSubTab[CashMBlotterFactory.prototype.selectedTabId] = CashMBlotterFactory.prototype.currentBlotter.CurrentSubTab;
    //if (CashMBlotterFactory.prototype.selectedTabId.trim() == "wireTransaction") {
     //   showLoading = true;
   // }
    CashMBlotterFactory.prototype.currentBlotter.PostGridInfo["isRefreshCheck"] = checkIsChanged;
    if (CashMBlotterFactory.prototype.FinalFilterData) {
        CashMBlotterFactory.prototype.currentBlotter.PostGridInfo["filterData"] = JSON.stringify(CashMBlotterFactory.prototype.FinalFilterData);
    }
    else
        CashMBlotterFactory.prototype.currentBlotter.PostGridInfo["filterData"] = null;

    var gridInfo = $.parseJSON(CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.gridInfo);
    //if (isRefresh)
   // gridInfo.ClearSerializationData = false;
    gridInfo["GlobalID"] = app.instance.UserLoginId + "_" + CashMBlotterFactory.prototype.currentBlotter.GridInfo.CurrentPageId + "_" + app.instance.SessionId;
    CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.gridInfo = JSON.stringify(gridInfo);

    CashMBlotterFactory.prototype.currentBlotter.GridInfo.GlobalID = app.instance.UserLoginId + "_" + CashMBlotterFactory.prototype.currentBlotter.GridInfo.CurrentPageId + "_" + app.instance.SessionId;
    CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.currentBlotter = CashMNavigation.instance.CurrentSelectedTab;
    //CashMBlotterFactory.prototype.InitializeGridInfo();
    CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange = CashMBlotterFactory.prototype.BlotterDateRange;
    for (i = 0; i < CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange.length; i++) {
        if (CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange[i].Key == CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.currentBlotter) {
            if (CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.filterOn != undefined) {
                CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange[i].Values[0] = CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.filterOn[0].Values[0];
                CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange[i].Values[1] = CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.filterOn[0].Values[1];
            }
            else if (CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.startDate != undefined && CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.startDate != undefined) {
                CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange[i].Values[0] = CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.startDate;
                CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.blotterDateRange[i].Values[1] = CashMBlotterFactory.prototype.currentBlotter.PostGridInfo.endDate;
            }
        }
    }
    $.when(callService("/Resources/Services/CashMBlotterService.svc/GetBlottersCount", CashMBlotterFactory.prototype.currentBlotter.PostGridInfo)).then(function (response) {
       
        CashMBlotterFactory.prototype.BlottersCount = $.parseJSON(response.d);
        CashMCommonUtils.prototype.BindBlotterandTabCount(CashMBlotterFactory.prototype.currentBlotter.CurrentSelectedTab, CashMBlotterFactory.prototype.BlottersCount);
    });
        
    return $.when(callService(CashMBlotterFactory.prototype.currentBlotter.GridBlotterUrl, CashMBlotterFactory.prototype.currentBlotter.PostGridInfo, showLoading)).then(function (response) {
        try
        {
            $("#cm_gridrefreshrequired").hide();
            if (isRefresh) {
                var data = $.parseJSON(response.d);
                if (checkIsChanged && !data.IsRefresh)
                    return response;
                $find("RADXLGridBlotter").refreshGrid(); // $("#RADXLGridBlotter").refreshGrid();
            }
            else {
                var data = $.parseJSON(response.d);
                var info = CashMBlotterFactory.prototype.currentBlotter.GridInfo;
                if (data && data.GridInfo != null && data.GridInfo != undefined)
                    info.GridCustomRowFormatData = data.GridInfo.GridCustomRowFormatData;
                //    info = data.GridInfo;
                //info.ColumnWidth = CashMBlotterFactory.prototype.currentBlotter.GridInfo.ColumnWidth;
                info.ServiceUrl = iago.baseUrl;
                $("#RADXLGridBlotter").remove();
                $("#RADXLGridBlottermainDiv").empty();
                $("#RADXLGridBlottermainDiv").append('<div id="MVRADXLGridBlotter"></div><div id="ADRADXLGridBlotter"></div><div id="RADXLGridBlotter" class="ag-theme-balham ag-theme-ivprad" style="height:100%"></div>');
                //xlgridloader.create("RADXLGridBlotter", "test", CashMBlotterFactory.prototype.currentBlotter.GridInfo, "");
                //xlgridloader.create("RADXLGridBlotter", "test", info, "");
               
                adaptablegridbundle.initialize({ GridInfo: info });
             
            }
            //$("#cmBlotterAction").animate({top: '250px'});

            CashMBlotterFactory.prototype.currentBlotter.pageLoadTime = new Date().format("yyyyMMdd HH:mm:ss");
            return response;
        }
        catch(err)
        {
            $('#spinnerDiv').hide(); 
        }
    });
}
