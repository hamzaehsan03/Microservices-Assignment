document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');

    const typesAPI = 'http://localhost:80/type';


    async function fetchJokeTypes() {
        try 
        {
            const response = await fetch(typesAPI);
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

    fetchJokeTypes();

    jokeTypeSelect.addEventListener('click', fetchJokeTypes);

});