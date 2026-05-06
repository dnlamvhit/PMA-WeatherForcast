1.General requirements:
- Build a weather app that will take in user-input and then gather data from outside sources (API retrieval) to provide the user with relevant real-time information based on their requests. 
- Let users see the weather based on their current location as default and based on location they are interested in (any of the following:  Zip Code/Postal Code, GPS Coordinates, Landmarks, Town, City, etc..). You have autonomy to determine how to handle how the user should enter their location. 
- Guide the user through their input, validate their input and then store their input and retrieved API data into a database.
- I am looking not-only for your technical aptitude but also your ability to think creatively and design innovative solutions.  
- Generate README file on how to run it, What responsive design techniques were used and what you did so that I can publish on github. 
- The weather app should include the author name: Lam Ngoc Dao, email: dnlamvhit@gmail.com and an informational details which provides a description of the PM Accelerator company (owner) (https://www.linkedin.com/company/pm-accelerator).
2.Frontend: 
- Technology Stack = NextJS (but not use Python or Java frameworks for frontend).
- Shows the weather clearly, with any details you think are useful.
- Use icons or images to make the weather info look cool using any design standards.
- Add a 5-day forecast: Display the 5-day forecast in a clear and organized manner. This could be a horizontal or vertical list, a grid, or any other user-friendly layout.
- Add error-handling functionality: handling errors gracefully (e.g., display a message if location is not found or if the API request fails).
- Focus on web first approach but adapt seamlessly to various screen sizes and devices (desktops, tablets, smartphones)
3.Backend: 
- Use RESTful APIs for communication between the front-end and back-end, or between different back-end services
- Don’t give static information. Use any APIs to pull real weather information
- Focus on persistence with CRUD functionality as well as API calls and error handling. Try to add as many functionalities as possible. 
- Allow users to export data from the database into selected or all formats: JSON, XML, CSV (delimited), PDF, Markdown output format(s).  
- Based on the location information users provided (above) perform (any of) the following: Youtube videos of the location, Google Map data of the exact or approximate location. Be creative by using any additional free API’s such as https://www.freecodecamp.org/news/public-apis-for-developers/
4.Database: Choose a database (SQL or noSQL) to have data persistence and incorporate the following functionality:
- CREATE:  Allow user(s) to enter both a location and a date range and output temperate for that location within that date ranges specified. Store all this information into a database. Validate the date ranges. Validate that the location really exists (or allow fuzzy match for system to determine location)
- READ: Allow users to also be able to read any of the weather information (and anything else stored in the database) they have requested previously (or even what others have entered). Row level security is not necessary to segment the data by users.
- UPDATE: Allow users to be able to update any of the weather information stored in the database. (You can pick which data should and shouldn't be updated). As above have validations so user input is not incoherent or a location is incorrect.
- DELETE: Allow users to be able to delete any of the records in the database.