document.addEventListener('DOMContentLoaded', function() {

    // Retrieve references to html elements
    const jokeTypeSelect = document.getElementById('jokeType');
    const getJokeButton = document.getElementById('getJoke');
    const jokeDisplay = document.getElementById('joke');

    // Function to fetch joke types and populate the dropdown
    async function fetchJokeTypes() {
        try 
        {
            // Performs a fetch request to get jokes from the types endpoint
            // Check if the response was successful
            const response = await fetch('/joke/type');
            if (!response.ok) 
            {
                throw new Error('Failed to fetch joke types');
            }

            const types = await response.json();

            // Remember the current selection for the dropdown
            const currentSelection = jokeTypeSelect.value;

            // Add a default Any option
            jokeTypeSelect.innerHTML = '<option value="any">Any</option>';
            
            // Iterate through the fetched joke types, create and append option elements
            types.forEach(type => {
                const option = document.createElement('option');

                // Set the value of the option to the type name
                option.value = type.type_name; 

                // Set the text for the option and capitilise the first letter
                option.textContent = type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1);
                jokeTypeSelect.appendChild(option);
            });

            // Revert back to the selection
            if (jokeTypeSelect.querySelector(`option[value="${currentSelection}"]`)) 
            {
                jokeTypeSelect.value = currentSelection;
            }
        } 

        catch (error) 
        {
            console.error('Error fetching joke types:', error);
        }
    }
    

    // Function to fetch a joke
    async function fetchJoke() {

        // Retrieve the selected joke type
        const type = jokeTypeSelect.value;
        try 
        {
            // Attempt a fetch request including the selected type
            const response = await fetch(`/joke/joke?type=${encodeURIComponent(type)}`);
            if (!response.ok) 
            {
                throw new Error('Failed to fetch joke');
            }
            // Parse the response as JSON       
            const jokes = await response.json();

            // Display the first joke's text
            if (jokes.length > 0) 
            {
                jokeDisplay.textContent = jokes[0].joke_text;
            } 

            // Otherwise display a message if no jokes were found of that type
            else 
            {
                jokeDisplay.textContent = 'No joke found for the selected type.';
            }
        } 
        
        catch (error) 
        {
            console.error('Error fetching joke:', error);
            jokeDisplay.textContent = 'Failed to fetch joke.';
        }
    }

    // Fetch the joke types to populate the dropdown on page load
    fetchJokeTypes();

    // Add an event listener to refetch the joke types if the dropdown is clicked
    jokeTypeSelect.addEventListener('click', fetchJokeTypes);

    // Fetch a joke when the 'Get Joke' button is clicked
    getJokeButton.addEventListener('click', fetchJoke);
});
