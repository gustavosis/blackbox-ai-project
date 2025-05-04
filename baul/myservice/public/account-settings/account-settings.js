document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('accountSettingsForm');
  const roleSelect = document.getElementById('roleSelect');
  const nameInput = document.getElementById('nameInput');
  const lastnameInput = document.getElementById('lastnameInput');
  const emailInput = document.getElementById('emailInput');
  const phoneInput = document.getElementById('phoneInput');
  const serviceInput = document.getElementById('serviceInput');
  const profileImageInput = document.getElementById('profileImageInput');

  // Load user data and populate form
  async function loadUserData() {
    try {
      const response = await fetch('/user-profile', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      const user = data.user;

      roleSelect.value = user.role || 'user';
      nameInput.value = user.name || '';
      lastnameInput.value = user.lastname || '';
      emailInput.value = user.email || '';
      phoneInput.value = user.phone || '';
      serviceInput.value = user.service || '';
      profileImageInput.value = '';

    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading user data. Please ensure you are logged in.');
    }
  }

  // Upload profile image immediately on change
  profileImageInput.addEventListener('change', async () => {
    if (profileImageInput.files.length === 0) return;

    const imageData = new FormData();
    imageData.append('profileImage', profileImageInput.files[0]);

    try {
      const response = await fetch('/user-profile', {
        method: 'PUT',
        credentials: 'include',
        body: imageData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la imagen de perfil');
      }

      const data = await response.json();
      alert('Imagen de perfil actualizada correctamente');
      await loadUserData();

    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(error.message);
    }
  });

  // Fix: Remove profileImage from form data in saveUserProfileChanges
  async function saveUserProfileChanges(event) {
    event.preventDefault();

    if (!nameInput.value.trim() || !lastnameInput.value.trim() || !emailInput.value.trim()) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const formData = new FormData();
    formData.append('role', roleSelect.value);
    formData.append('name', nameInput.value.trim());
    formData.append('lastname', lastnameInput.value.trim());
    formData.append('email', emailInput.value.trim());
    formData.append('phone', phoneInput.value.trim());
    formData.append('service', serviceInput.value.trim());

    try {
      const response = await fetch('/user-profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      alert('Perfil actualizado correctamente');
      await loadUserData();

    } catch (error) {
      console.error('Error saving user profile:', error);
      alert(error.message);
    }
  }

  // Remove duplicate saveUserProfileChanges function

  // Re-attach the event listener with the correct function reference
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveUserProfileChanges(event);
  });

  loadUserData();
});
