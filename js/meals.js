document.querySelectorAll('.toggle-ingredients-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const ingredientsElement = document.getElementById(`ingredients-${index}`);
      const stepsElement = document.getElementById(`steps-${index}`);
  
      if (stepsElement.style.display === 'block') {
        stepsElement.style.display = 'none';
      }
  
      ingredientsElement.style.display = ingredientsElement.style.display === 'block' ? 'none' : 'block';
    });
  });
  
  document.querySelectorAll('.toggle-steps-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const ingredientsElement = document.getElementById(`ingredients-${index}`);
      const stepsElement = document.getElementById(`steps-${index}`);
  
      if (ingredientsElement.style.display === 'block') {
        ingredientsElement.style.display = 'none';
      }
  
      stepsElement.style.display = stepsElement.style.display === 'block' ? 'none' : 'block';
    });
  });
  
  document.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', () => {
      const mealId = button.getAttribute('data-meal-id');
      openDeleteModal(mealId);
    });
  });
  
  document.getElementById('delete-confirm').addEventListener('click', deleteMeal);
  document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
  
  let mealIdToDelete;
  
  function openDeleteModal(mealId) {
    mealIdToDelete = mealId;
    document.getElementById('delete-modal').style.display = 'block';
  }
  
  function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
  }
  
  async function deleteMeal() {
    try {
      const response = await fetch(`/delete-meal/${mealIdToDelete}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        closeDeleteModal();
        location.reload();
      } else {
        console.error('Error deleting meal');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  }
  
  