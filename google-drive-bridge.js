/*
  GOOGLE DRIVE BRIDGE SCRIPT
  
  DIRECTIONS:
  1. Go to https://script.google.com/
  2. Create a new Project.
  3. Paste this code into the editor.
  4. Create a folder in your Google Drive named "RBU_Notice_Archive".
  5. Replace 'YOUR_FOLDER_ID_HERE' below with the ID of that folder (found in the folder URL).
  6. Click "Deploy" -> "New Deployment".
  7. Select Type: "Web App".
  8. Set "Execute as": "Me".
  9. Set "Who has access": "Anyone".
  10. Copy the Web App URL and add it to your .env as VITE_GOOGLE_DRIVE_BRIDGE_URL.
*/

const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const folder = DriveApp.getFolderById(FOLDER_ID);

        // Create new file from base64 data
        const blob = Utilities.newBlob(Utilities.base64Decode(data.data), data.mimeType, data.filename);
        const file = folder.createFile(blob);

        // Set file to be viewable by anyone with the link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const result = {
            success: true,
            fileId: file.getId(),
            viewUrl: file.getDownloadUrl(),
            webviewUrl: file.getUrl()
        };

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle preflight CORS requests
function doOptions(e) {
    return ContentService.createTextOutput("")
        .setMimeType(ContentService.MimeType.TEXT);
}
