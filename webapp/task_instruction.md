Hierarchical Space Navigator - Take-Home Interview Question
===========================================================

Project Overview - [🎥 Loom Video Overview](https://www.loom.com/share/3d0f7e5de8ef4f1fb765212e6c98c39d?sid=)
-------------------------------------------------------------------------------------------------------------

### Problem Background and Context

In order to organize cameras at your sites (e.g San Jose Corporate Office Building) you can place cameras (streams) in “spaces” (e.g. 2nd Floor). These spaces can be further broken down into smaller sub-spaces (eg. 2nd Floor → East Wing → Storage Closets). And each sub-space can contain more cameras.

You can think of it as a folders and files on your compouters. You can have multiple computers ("sites") and in each computer you can have multiple folders ("spaces") that can contain files ("streams") as well as more folders.

**Example Hierarchy:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Site: San Jose Corporate Headquarters  │  ├── Floor 1  │   ├── Lobby  │   │   └── Reception Area  │   └── Main Entrance  │  ├── Floor 2  │   ├── Kitchen  │   │   └── Serving Area  │   ├── Breakroom  │   └── Conference Rooms  │       ├── Large Conference Room  │       └── Small Meeting Room  │  └── Parking Garage      ├── Main Entrance      └── Underground Level   `

Requirements
------------

### Functional Requirements

#### Step 1: Site Selector - [🎥 Loom Video](https://www.loom.com/share/2d62f900f8f540eca691debbc3315896?sid=)

*   **Note: The Site Names are different then what’s mentioned in the video**
    
    *   “Site 1” = “San Jose”
        
    *   “Site 2” = “Toronto”
        
    *   “Site 3” = “Mars”
        
*   Call API to get list of Sites
    
*   Display sites in a select box
    
*   Ability to select different Sites
    

#### Step 2: Basic Space Navigator - [🎥 Loom Video](https://www.loom.com/share/cd005304caae48068b157ee5bfe5c19a?sid=)

*   Use **“San Jose”** for basic flat Spaces data
    
*   Display Spaces section with tree structure for the **San Jose** spaces
    
*   Each Space should be expandable and collapsible
    
*   Ability to select to select/deselect individual cameras
    
*   Ability to select/deselect all Cameras in a Space
    
*   Spaces checkbox can have 3 states
    
    1.  De-selected
        
    2.  Fully selected (every single child in a given Space is selected)
        
    3.  Partially selected (at least 1 child is selected but not all children are selected in a given Space)
        

#### Step 3: Display List of Selected Cameras - [🎥 Loom Video](https://www.loom.com/share/b2a4a190b49147468d710c889a1cf3e8?sid=)

*   Display the list of selected cameras
    
*   Each item in the list should display just the camera name
    
*   On hover the of the item it should show an “x” button to the right of it that will remove the camera from the list and de-select the camera in the tree
    
    *   **Note:** This should have the same effect as clicking on the checkbox to deselect
        

#### Step 4: Handle Complicated Nested Space Structure - [🎥 Loom Video](https://www.loom.com/share/b11997ca95974f18ace916873a767ddf?sid=)

*   Use **“Toronto””** to get the more complicated Spaces data
    
*   Each level of the tree with children should be collapsible
    
*   Collapsed state should be maintained when collapsing and expanding the parent space
    

#### Step 5: Replace API With Your Own Implementation - [🎥 Loom Video](https://www.loom.com/share/f91de1766a2a478fab466174bb6cfb8d?sid=)

*   Create your own API using whatever framework you would like
    
*   Use the provided seedData.json to seed your database so you have exactly the same data as the provided API
    
*   Switch your frontend to point to your own API and everything should behave exactly the same
    

#### Step 6: Add The Ability To Add Streams To Spaces - [🎥 Loom Video](https://www.loom.com/share/469e05fcc53842129fad4070f6c42975?sid=)

*   Add a new API route for adding Streams to a Space
    
*   Add an add button next to each Space which shows an add modal for inputing the Stream name
    
*   This should be an optimistic UI update
    

#### Step 7: Add The Ability To Delete Streams - [🎥 Loom Video](https://www.loom.com/share/39d8f9bc5f9748f788f4c245d270bcd0?sid=)

*   Add a new API route for deleting. You can only delete Streams not Spaces
    
*   Add a delete button next to each stream that calls your new API when clicked
    
*   This should also be an optimistic UI update
    

### Technical Requirements

*   Must use React and Typescript
    
*   Everything else is up to you and what you’re most comfortable with. But do consider this as a feature you will be shipping so make reasonable choices. For example inline styles is probably not the right choice but using the fetch api to fetch data is perfectly fine
    
*   Treat it as feature that will be shipped to production
    

API Documentation
-----------------

### Base URL

https://interviews.ambient.ai/api/v1

### Available Endpoints

*   type Site = { id: string; name: string;};
    
    *   GET /sites
        
    *   Example Request
        
        *   https://interviews.ambient.ai/api/v1/sites
            
    *   Returns list of available sites
        
        *   **San Jose**: Flat structure with root-level spaces
            
        *   **Toronto**: Complex nested space hierarchy
            
        *   **Mars**: Error handling test case
            
        *   "sites": \[ { "id": 1, "name": "San Jose" }, { "id": 2, "name": "Toronto" }, { "id": 3, "name": "Mars" } \]}
            
*   type Stream = { id: number; name: string;};type Space = { id: number; name: string; streams: Stream\[\]; parentSpaceId: number | null;};type FlattenedSpacesData = { spaces: Space\[\];};
    
    *   GET /spaces
        
    *   Query Parameters
        
        *   siteId (required): The ID of the site to retrieve spaces for
            
    *   Example Request
        
        *   https://interviews.ambient.ai/api/v1/spaces?siteId=2
            
    *   Returns a list of Spaces for the given siteId
        
    *   sample response is{"spaces":\[{"spaces":\[{"id":2,"name":"Marketing","streams":\[{"id":1,"name":"Marketing Camera 1"},{"id":2,"name":"Marketing Camera 2"}\],"parentSpaceId":1},{"id":1,"name":"Main Building","streams":\[{"id":3,"name":"Main Entrance"},{"id":4,"name":"Reception Desk"},{"id":5,"name":"Main Lobby"},{"id":6,"name":"Security Desk"}\],"parentSpaceId":null}\]},{"spaces":\[{"id":3,"name":"Corporate Office","streams":\[{"id":7,"name":"Executive Suite"}\],"parentSpaceId":8},{"id":4,"name":"Break Room","streams":\[{"id":8,"name":"Cafeteria View"}\],"parentSpaceId":3},{"id":5,"name":"Conference Room A","streams":\[{"id":9,"name":"Conference Room Front"}\],"parentSpaceId":3},{"id":6,"name":"Training Center","streams":\[{"id":10,"name":"Training Room 1"},{"id":11,"name":"Training Room 2"}\],"parentSpaceId":3},{"id":7,"name":"Cafeteria","streams":\[{"id":12,"name":"Dining Area"}\],"parentSpaceId":3},{"id":9,"name":"Storage Room","streams":\[\],"parentSpaceId":3},{"id":8,"name":"Corporate Office","streams":\[{"id":13,"name":"Main Hallway"},{"id":14,"name":"Elevator Lobby"},{"id":15,"name":"Reception"}\],"parentSpaceId":null},{"id":10,"name":"Research Wing","streams":\[{"id":16,"name":"Lab Camera"}\],"parentSpaceId":null}\]},{"spaces":\[{"id":11,"name":"Warehouse","streams":\[{"id":17,"name":"Loading Dock 1"},{"id":18,"name":"Loading Dock 2"}\],"parentSpaceId":null}\]}\]}
        

Submission Guidelines and Deliverables
--------------------------------------

*   **IMPORTANT**: The final submission must be directly in this CoderPad environment. This should be fully functional code that can be run the CoderPad environment. Since we can’t run your API in CoderPad include a demo video of your app running locally using your API implementation showing the add and delete functionality.
    
*   For your server implementation add all the code in the server directory for review
    
*   We will only review code in the CoderPad and test the functionality in CoderPad
    
*   **IMPORTANT**:Include a demo video walking through your app running locally pointing to your API implementation showing the add and delete functionality
    
*   Ensure all requirements are met
    
*   Write production-ready code
    
    *   No TODOs or pseudocode
        
*   Handle all possible application states
    

Development Environment
-----------------------

*   Use whatever development environment or IDE you’re most comfortable with
    
    *   VS Code, Cursor, Vim, etc.
        
    *   Use npm create vite@latest physical-spaces-navigator -- --template react-ts setup the project as this very closely aligns with the CoderPad setup. So it should make copying and pasting your final solution straightforward.
        
    *   If you would like you can also work directly in the CoderPad environment
        
*   Feel free to use any AI tools like Claude, ChatGPT, etc.
    
*   Use whatever other packages your most comfortable with
    
    *   In CoderPad in the Program Output pane on the right there is a “Shell” tab on the bottom where you can npm install any of the packages you decide to use
        

Evaluation Criteria
-------------------

1.  **Functionality**
    
2.  **Code Quality**
    
3.  **Product Sense**
    
4.  **Component Design**
    
5.  **TypeScript Usage**
    
6.  **State Management**
    
7.  **Error Handling**
    
8.  **Production Readiness**
    

Next Steps
----------

*   The next step will be call with a few of our engineers
    
*   Come prepared with your solution running locally. Be ready to demo and show code
    
*   You will be asked to explain why you made certain decisions
    
*   There will be a few follow-up questions that will require you to adapt your solution to changing criteria
    
*   This will not involve live coding