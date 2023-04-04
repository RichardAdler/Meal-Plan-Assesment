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
  