public with sharing class UploadFileController {
	@AuraEnabled
	public static Id saveTheFile(Id parentId, String fileName, String base64Data, String contentType) {
			base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
			blob data = EncodingUtil.base64Decode(base64Data);

			Attachment att = new Attachment();
      att.ParentId = parentId;
      att.Body = data;
      att.Name = fileName;
      att.ContentType = contentType;
      insert att;
			return att.Id;
	}

	@AuraEnabled
	public static Id saveTheChunk(Id parentId, String fileName, String base64Data, String contentType, String fileId) {
		if (fileId == '') {
			fileId = saveTheFile(parentId, fileName, base64Data, contentType);
		} else {
				 appendToFile(fileId, base64Data);
		}
		System.debug('saveTheChunk, return value = ' + Id.valueOf(fileId));
		return Id.valueOf(fileId);
 }

 private static void appendToFile(Id fileId, String base64Data) {
	 base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
	 System.debug('appendToFile, return value = ' + fileId);
	 Attachment att = [SELECT Id, Body FROM Attachment WHERE Id = :fileId];
	 String storedData = EncodingUtil.base64Encode(att.Body);
	 att.Body = EncodingUtil.base64Decode(storedData + base64Data);
	 update att;
	}

	@AuraEnabled
	public static Id cloneAttToCv(Id attachId)
	{
		Attachment att = [SELECT Id, Name, Body, ParentId, ContentType FROM Attachment WHERE Id = :attachId];
		String[] nameArr = att.Name.split('\\.', -1);
		String fileName = '';
		String ext = '';
		if(att.Name.contains('.')) {
			ext = nameArr[nameArr.size() - 1];
			fileName = att.Name.substring(0, att.Name.length() - ( ext.length() + 1));
		} else {
			fileName = att.Name;
		}

		ContentVersion cv = new ContentVersion();
		cv.VersionData = att.Body;
		cv.Title = fileName;
		cv.PathOnClient = '/'+att.Name;

		insert cv;
		ContentDocumentLink cdl = new ContentDocumentLink();
		cdl.LinkedEntityId = att.ParentId;
		cv = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
		cdl.ContentDocumentId = cv.ContentDocumentId;
		cdl.ShareType = 'I';
		cdl.Visibility = 'AllUsers';
		insert cdl;

		System.debug('colneAttToCv, cv.Id = ' + cv.Id);

		delete att;
		return cv.Id;
	}
}
