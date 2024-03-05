document.addEventListener('DOMContentLoaded', function() {
    const jokeTypeSelect = document.getElementById('jokeType');
    const jokeFormSelect = document.getElementById('jokeForm');
    const submitJokeButton = document.getElementById('submitJoke');

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

    async function getSubmission()
    {
        const jokeType = document.getElementById('jokeType').value();
        const jokeText = document.getElementById('jokeText').value();

        try
        {
            fetch('/sub', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: jokeType,
                    jokeText: jokeText
                })
            })
            .then(response => {
                if (!response.ok)
                {
                    throw new Error('Failed to submit joke')
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(`Error ${error}`)
            });
        }
        catch(error)
        {
            console.log(`Error ${error}`)
        }
    }

    fetchJokeTypes();

    jokeTypeSelect.addEventListener('click', fetchJokeTypes);
    submitJokeButton.addEventListener('click', getSubmission);

});