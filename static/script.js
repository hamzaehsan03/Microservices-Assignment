document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');
    const getJokeButton = document.getElementById('getJoke');
    const jokeDisplay = document.getElementById('joke');

    // Function to fetch joke types and populate the dropdown
    async function fetchJokeTypes() {
        try 
        {
            const response = await fetch('/type');
            if (!response.ok) 
            {
                throw new Error('Failed to fetch joke types');
            }

            const types = await response.json();
            jokeTypeSelect.innerHTML = '<option value="any">Any</option>'; // Reset and add default 'any' option
            
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.type_name; 
                option.textContent = type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1);
                jokeTypeSelect.appendChild(option);
            });
        } 

        catch (error) 
        {
            console.error('Error fetching joke types:', error);
        }
    }

    // Initial fetch of joke types when the page loads
    fetchJokeTypes();

    // Refetch joke types when the dropdown is clicked
    jokeTypeSelect.addEventListener('click', fetchJokeTypes);

});
