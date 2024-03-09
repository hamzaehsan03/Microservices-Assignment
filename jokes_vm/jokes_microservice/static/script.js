document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');
    const getJokeButton = document.getElementById('getJoke');
    const jokeDisplay = document.getElementById('joke');

    // Function to fetch joke types and populate the dropdown
    async function fetchJokeTypes() {
        try 
        {
            const response = await fetch('/joke/joke/type');
            if (!response.ok) 
            {
                throw new Error('Failed to fetch joke types');
            }

            const types = await response.json();

            // Remember the current selection for the dropdown
            const currentSelection = jokeTypeSelect.value;
            // Add a default Any option
            jokeTypeSelect.innerHTML = '<option value="any">Any</option>';
            
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.type_name; 
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
        const type = jokeTypeSelect.value;
        try 
        {
            const response = await fetch(`/joke/joke?type=${encodeURIComponent(type)}`);
            if (!response.ok) 
            {
                throw new Error('Failed to fetch joke');
            }
            const jokes = await response.json();

            if (jokes.length > 0) 
            {
                jokeDisplay.textContent = jokes[0].joke_text;
            } 

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

    // Initial fetch of joke types when the page loads
    fetchJokeTypes();

    // Refetch joke types when the dropdown is clicked
    jokeTypeSelect.addEventListener('click', fetchJokeTypes);

    // Fetch a joke when the 'Get Joke' button is clicked
    getJokeButton.addEventListener('click', fetchJoke);
});
