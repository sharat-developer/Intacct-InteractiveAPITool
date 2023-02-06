# Intacct-InteractiveAPITool
A tool helps the developers to construct and post Sage Intacct web-service API requests easily and intuitively.

Features
------------
#### 1. "Quick test"
Users can fill in the Intacct instance credentials in the `Configurations` screen and make the API calls without having to save the credentials and also without logging into the app.

##### Demo
![Demo video](videos/gifs/1.%20%22Quick%20test%22-v_2.gif)

##### How it helps
- Users can build and post the API requests directly. The app does not force users to log in to test some API requests quickly.
- Data is secure, as the sensitive data is not stored locally (or anywhere else) in this approach.

##### How it works
- Intacct instance credentials entered on the `Configuration` screen is used to form the `<control>` and `<authentication>` sections of the API request.

>_The downside of this approach is - "Configuration data reuse" and "Request history" features of the apps cannot be used. Check-out the below sections to see how you can use this app effectively by utilizing both the feature._


#### 2. "Secure user profile with Configuration data reuse"
Create a user and save the Intacct instance credentials on your browser locally in a secure way.

##### Demo
![Demo video](videos/gifs/2.%20"Secure%20user%20profile%20with%20Configuration%20data%20reuse".gif)

##### How it helps
- Authentication for data access: The user needs to login with his master password to access the Intacct instance credentials data. The user session ends on either logout or closing the browser.
- Data is secure: The sensitive data are stored locally using a highly secured data encryption mechanism.
- Data re-use: Users can select the desired Intacct instance credentials from the `Saved Configurations` dropdown list.
- Labeling the data: Users can name the credentials-set with a custom name!
- Easier to manage the data: One place for managing the Intacct instance credentials data. You can add and modify the credentials. Also, there are options to clear and delete the credentials.

##### How it works
- The app user's master password hashed with the **SHA3** algorithm. A random (512/8) salt generated along with the password hash. These password hash and salt are then used to create the encryption key (512/32) with the **PBKDF2** algorithm.
- Sensitive data like Intacct user passwords and sender passwords are encrypted in **AES** encryption with the encryption key and are saved locally (on the local storage of the browser).

#### 3. "Dynamic meta-data retrieval for the instance"
Users can select the objects associated with an instance dynamically.

##### Demo
![Demo video](videos/gifs/3.%20%22Dynamic%20meta-data%20retrieval%20for%20the%20instance%22.gif)

##### How it helps
- Once you switch over to the `API 3.0` tab, the corresponding objects (of the selected Intacct instance credentials) get auto-populated in the `Select Object` dropdown field. This helps users to choose the desired object dynamically (even the custom objects of the instance) rather than a static list of objects.

##### How it works
- A meta-data API query fetches the list of objects (including custom objects) and populates the `Select object` dropdown field.


#### 4. "Method association for the object"
Users can dynamically select the methods associated with an object.

##### Demo
![Demo video](videos/gifs/4.%20%22Method%20association%20for%20the%20object%22.gif)

##### How it helps
- The user is allowed to select the methods associated with the selected object. More importantly, this helps users to run the generic methods like getAPISession, getUserPermission, installApp, etc.., which do not need the object context!

##### How it works
- When the object is not selected,  the `Select Generic Method` dropdown shows up with generic method names.


#### 5. "Request template association for the method & object"
Once a particular object and method are selected, the corresponding request template gets loaded by the app. This template acts as a skeleton for you to build your complete request.

##### Demo
![Demo video](videos/gifs/5.%20%22Request%20template%20association%20for%20the%20method%20%26%20object%22.gif)
##### How it helps
- Helps user to build the request XML with a request template for the selected object and method

##### How it works
- A request template got generated for a selected method. The corresponding object value gets substituted in the request template.

#### 6. "Interactive & Dynamic query builder with meta-data retrieval for the object"
Users can build the query dynamically by selecting the field and value using the interactive query builder tool.

##### Demo
![Demo video](videos/gifs/6.%20%22Interactive%20%26%20Dynamic%20query%20builder%20with%20meta-data%20retrieval%20for%20the%20object%22.gif)

##### How it helps
- The app helps users to build the query dynamically for the selected object and criteria. This intuitive UI tool helps to construct the query using clicks rather than writing the cryptic query string.

##### How it works
- Users get an option to build the query using a construct query tool. By this, one can add or chain the multiple query criteria. A dynamic query string is constructedUsing the field and value combination of the query. Finally, the request template gets substituted with the dynamic query before posting the API request.

>_The `select fields` section gets enabled on the click of the `+ Show Fields` button. Here this allows the users to select the fields to be included in the response._

#### 7. "Interactive & Dynamic request builder with meta-data retrieval for the object"
Users can build the create and update requests dynamically by selecting the field and value using the interactive request builder tool.

##### Demo
![Demo video](videos/gifs/7.%20%22Interactive%20%26%20Dynamic%20request%20builder%20with%20meta-data%20retrieval%20for%20the%20object%22.gif)

##### How it helps
- Helps to build the create and update request XML dynamically for the selected object, field, and values. Again, this intuitive UI tool assists the users to construct the request using clicks rather than writing the cryptic XML payload.

##### How it works
- Users provided with an option to build the request XML for create and update methods using `select fields` and `put value in the fields` UI sections. By this, one can select and provide value to the fields. A request XML is constructed using the selected field-value combination. Finally, the request template is substituted with the dynamic request XML.

>_Required fields are pre-selected (and obviously, disabled to deselect) in the `select fields` section of the screen. Mouse-hover on the field displays meta-data info of the same._


#### 8. "Intuitive request editor & formatter"
Have the flexibility to edit and format the API requests manually and post.

##### Demo
![Demo video](videos/gifs/8.%20%22Intuitive%20request%20editor%20%26%20formatter%22.gif)

##### How it helps
- Allows the user to edit the request XML that the tool has generated, so that the user can overwrite and modify the request XML to his needs.
- If the changes are done manually by editing the request XML, you can click on the `Format` button to arrange the XML in a nicely indented format.

##### How it works
- The format button beatifies the XML data.

#### 9. "API Request & API Response viewer with the Response Metrics"
Have a flexibility view and copy the API request and response.

##### Demo
![Demo video](videos/gifs/9.%20%22API%20Request%20%26%20API%20Response%20viewer%20with%20the%20Response%20Metrics%22.gif)

##### How it helps
- Allow the users to view the API response once received. Users can select and copy the response from the `API Response` tab.
- Also, there's an `API Request` tab to show the complete API request (including the control and authentication blocks) posted by the user.
- The response metrics such as `Post URL`, `Response Time`, and `Status Code` are also shown for each API response.

##### How it works
- Both request and response data are formatted and presented in different sections for transparency.


#### 10. "Request History"
Users can see the last 30 API requests stored in the Request history (a table in local storage).

##### Demo
![Demo video](videos/gifs/10.%20%22Request%20history%22.gif)

##### How it helps
- The app allows the users to navigate and view the previous requests and reuse them. Also, users can load the previous requests and make modifications by overwriting them.

##### How it works
- Once a request is posted, the app stores the content part of the API request in a table of the local storage. This table can hold a maximum of up to 30 requests. It works on a circular queue approach.

>_There are also options to navigate to the first and last requests of the Request history queue._

#### 11. "Legacy Request builder and poster"
Users can also build and post the legacy API (v-2.1) requests.

##### Demo
![Demo video](videos/gifs/11.%20%22Legacy%20Request%20builder%20and%20poster%22.gif)
##### How it helps
- The app allows the user to build and post API version-2.1 requests if needed.

##### How it works
- Go to the `API-2.1` tab and build the request XML.

>_Request History of API-3.0 and API-2.1 are separate!_


Installation
------------

To install the extension into Chrome (tested on Version 44.0.2403.125 m)

* Download the source zip file using below URL and extract it :

    [https://github.com/sharat-developer/Intacct-InteractiveAPITool/archive/master.zip](../../archive/master.zip)

    or checkout via git

        git clone https://github.com/sharat-developer/Intacct-InteractiveAPITool.git

* In Chrome, go to "chrome://extensions/"
* Enable "Developer Mode" via the checkbox at the top
* Click the "Load unpacked extension..." button and select the folder where you extracted the zip file

Usage
------------
* Launch "InteractiveAPITool" from Chrome Apps
* Key-in your Company configuration details then go to API-3.0 and API-2.1 Tabs for Building and Posting API Requests.
* If you want store the Company configuration for later use, click on "Save" button which opens a login pop-up.
* Click on "Need an Account?" link and sign-up for creating an account.

Ext Libraries Used
------------
* jQuery
    License - https://github.com/jquery/jquery/blob/master/LICENSE.txt

* Twitter Bootstrap
    License - https://github.com/twbs/bootstrap/blob/master/LICENSE

* [CryptoJS](https://code.google.com/archive/p/crypto-js/)
    License - https://code.google.com/archive/p/crypto-js/wikis/License.wiki
