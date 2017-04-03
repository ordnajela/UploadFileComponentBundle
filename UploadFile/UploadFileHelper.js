({
    MAX_FILE_SIZE: 4500000,
    CHUNK_SIZE: 450000,

    save : function(component) {
        var fileInput = component.find("file").getElement();
    	var file = fileInput.files[0];

        if (file.size > this.MAX_FILE_SIZE) {
          // resetear componente
          this.resetComponent(component);
          this.makeToast("Error", "El tamaño del archivo no puede exceder " + this.MAX_FILE_SIZE + " bytes.\n"
          + "Archivo seleccionado: " + file.size + " bytes.", "error");
    	    return;
        }

        var fr = new FileReader();

        var self = this;
		fr.onload = $A.getCallback(function(){
    		var fileContents = fr.result;
    	    var base64Mark = 'base64,';
            var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
            console.log("DATA STATRT", dataStart);

            fileContents = fileContents.substring(dataStart);
            console.log(fileContents);

    	    self.upload(component, file, fileContents);
		});

        fr.readAsDataURL(file);
    },

    upload: function(component, file, fileContents) {
        var fromPos = 0;
        var toPos = Math.min(fileContents.length, fromPos + this.CHUNK_SIZE);

       	// start with the initial chunk
        this.uploadChunk(component, file, fileContents, fromPos, toPos, '');
    },

    uploadChunk : function(component, file, fileContents, fromPos, toPos, attachId) {
      console.log("Me han llamado");
        var action = component.get("c.saveTheChunk");
        var chunk = fileContents.substring(fromPos, toPos);
        console.log("chunkfull = ", fileContents);
        console.log("from ", fromPos, " to ", toPos);
        console.log("chunk = ", chunk);

        action.setParams({
            parentId: component.get("v.parentId"),
            fileName: file.name,
            base64Data: encodeURIComponent(chunk),
            contentType: file.type,
            fileId: attachId
        });

        var self = this;
        action.setCallback(this, function(response) {
          var state = response.getState();
          if(state === "SUCCESS") {
            attachId = response.getReturnValue();

            fromPos = toPos;
            toPos = Math.min(fileContents.length, fromPos + self.CHUNK_SIZE);

            if (fromPos < toPos) {
              // el archivo no ha terminado de ser cargado
              var progressBar = component.find("progressBar").getElement();
              progressBar.style.width = parseInt(toPos/fileContents.length * 100) + "%";
            	self.uploadChunk(component, file, fileContents, fromPos, toPos, attachId);
            }
            else {
              // el archivo terminó su carga y ahora es copiado a un content version
              self.clone(component, attachId);
            }
          }
          if(state === "ERROR") {
            this.makeToast("Error", response.getError()[0].message, "error");
            // resetear componente
            this.resetComponent(component);
          }
        });
        $A.enqueueAction(action);
    },
    clone : function(component, attachId) {
      var actionClone = component.get("c.cloneAttToCv");
      actionClone.setParams({
        "attachId" : attachId
      });
      actionClone.setCallback(this, function(response) {
        // resetear componente
        this.resetComponent(component);
        var state = response.getState();
        if(state === "SUCCESS") {
          this.makeToast("Éxito", "Archivo cargado", "success");
        }
        if(state === "ERROR") {
          this.makeToast("Error", response.getError()[0].message, "error");
        }
      });

      $A.enqueueAction(actionClone);
    },
    makeToast : function(title, message, type) {
      var toastEvent = $A.get("e.force:showToast");
      toastEvent.setParams({
        "title": title,
        "message": message,
        "type" : type
      });
      toastEvent.fire();
    },
    resetComponent : function(component) {
      var spinner = component.find("spinner");
      $A.util.addClass(spinner, "slds-hide");
      var butt = component.find("butt");
      butt.set("v.disabled", true);
      var inputFile = component.find("file").getElement();
      inputFile.value = "";
      component.set("v.fileName", "");
      var progressBar = component.find("progressBar").getElement();
      progressBar.style.width = "0%";
    }
})
