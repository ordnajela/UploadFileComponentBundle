({
    save : function(component, event, helper)
    {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, "slds-hide");
        // disable butt
        var butt = component.find("butt");
        butt.set("v.disabled", true);
        helper.save(component);
    },
    enableButt : function(component, event, helper)
    {
        var butt = component.find("butt");
        butt.set("v.disabled", false);
        var inputFile = component.find("file").getElement();
        component.set("v.fileName", inputFile.value);
    },
    openDialog : function(component, event, helper) {
      var inputFile = component.find("file").getElement();
      inputFile.click();
    },
    removeSelectedFile : function(component, event, helper) {
      var inputFile = component.find("file").getElement();
      inputFile.value = "";
      component.set("v.fileName", "");
      var butt = component.find("butt");
      butt.set("v.disabled", true);
    }    
})
