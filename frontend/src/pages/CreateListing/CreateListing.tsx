import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import listingService from '../../services/listing.service';
import authService from '../../services/auth.service';
import styles from './CreateListing.module.css';

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  category_id: number;
  location: string;
  condition: string;
  images: File[];
  image_url: string;
  image_urls: string[];
}

interface Category {
  id: number;
  name: string;
}

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    category_id: 0,
    location: '',
    condition: 'хорошее',
    images: [],
    image_url: '',
    image_urls: []
  });
  
  const [categories] = useState<Category[]>([
    { id: 1, name: 'Диваны и кресла' },
    { id: 2, name: 'Столы и стулья' },
    { id: 3, name: 'Шкафы и комоды' },
    { id: 4, name: 'Кровати и матрасы' },
    { id: 5, name: 'Другое' }
  ]);
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  // Проверяем авторизацию пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/create-listing' } });
    }
  }, [isAuthenticated, navigate]);

  const conditions = [
    { value: 'новое', label: 'Новое' },
    { value: 'хорошее', label: 'Хорошее' },
    { value: 'среднее', label: 'Среднее' },
    { value: 'плохое', label: 'Плохое' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If it's a category change, set both category name and ID
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id.toString() === value);
      setFormData(prev => ({ 
        ...prev, 
        category: selectedCategory?.name || '',
        category_id: selectedCategory?.id || 0
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFiles = Array.from(e.target.files);
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    // Check if adding these new files would exceed the 10 image limit
    if (formData.images.length + selectedFiles.length > 10) {
      setGlobalError(`Максимальное количество фотографий: 10. Вы можете добавить еще ${10 - formData.images.length}.`);
      return;
    }
    
    // Check file sizes and filter out oversized files
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeInBytes);
    const validFiles = selectedFiles.filter(file => file.size <= maxSizeInBytes);
    
    if (oversizedFiles.length > 0) {
      setGlobalError(`${oversizedFiles.length} ${oversizedFiles.length === 1 ? 'файл превышает' : 'файлов превышают'} ${maxSizeInMB} МБ и ${oversizedFiles.length === 1 ? 'будет пропущен' : 'будут пропущены'}.`);
      
      // If all files are oversized, return
      if (validFiles.length === 0) return;
    }
    
    setIsUploading(true);
    
    // Add only valid files to form data
    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    
    // Generate preview URLs for valid files
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    
    // Clear errors related to images
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
    
    // Clear error after 5 seconds if we showed a warning about oversized files
    if (oversizedFiles.length > 0) {
      setTimeout(() => {
        setGlobalError(null);
      }, 5000);
    } else {
      setGlobalError(null);
    }
    
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!formData.image_url) {
      setGlobalError('Введите URL изображения');
      return;
    }

    // Validate if it's a valid URL
    try {
      new URL(formData.image_url);
    } catch (e) {
      setGlobalError('Введите корректный URL изображения');
      return;
    }

    // Check if adding this URL would exceed the 10 image limit
    if ((formData.images.length + formData.image_urls.length + 1) > 10) {
      setGlobalError(`Максимальное количество фотографий: 10. Вы можете добавить еще ${10 - formData.images.length - formData.image_urls.length}.`);
      return;
    }

    // Add URL to the list and update preview
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, prev.image_url],
      image_url: '' // Clear input field
    }));

    setPreviewImages(prev => [...prev, formData.image_url]);

    // Clear errors
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
    setGlobalError(null);
  };

  const removeImageUrl = (index: number) => {
    const actualIndex = formData.images.length + index;
    
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
    
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(actualIndex, 1);
      return newPreviews;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!formData.price.trim()) newErrors.price = 'Цена обязательна';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Введите положительное число';
    }
    if (!formData.category_id) newErrors.category = 'Выберите категорию';
    if (!formData.location.trim()) newErrors.location = 'Местоположение обязательно';
    if (formData.images.length === 0 && formData.image_urls.length === 0) newErrors.images = 'Добавьте хотя бы одно фото';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setGlobalError(null);
    
    try {
      // 1. Создаем объявление
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category_id: formData.category_id,
        city: formData.location,
        condition: formData.condition
      };
      
      console.log("Submitting listing:", listingData);
      const response = await listingService.createListing(listingData);
      
      // Check if we got a valid listing ID back
      if (!response || !response.id) {
        throw new Error('Не удалось создать объявление - сервер не вернул ID');
      }
      
      const listingId = response.id;
      console.log(`Listing created successfully, ID: ${listingId}`);
      
      // 2. Затем загружаем изображения
      let mainImageSet = false;
      
      // Upload files
      if (formData.images.length > 0) {
        console.log(`Uploading ${formData.images.length} images for listing ${listingId}`);
        try {
          const uploadPromises = formData.images.map((image, index) => {
            return listingService.uploadImage(listingId, image)
              .then(response => {
                // Если это первое изображение, делаем его главным
                if (index === 0 && response && response.id && !mainImageSet) {
                  mainImageSet = true;
                  return listingService.setMainImage(listingId, response.id);
                }
              })
              .catch(error => {
                console.error(`Error uploading image ${index}:`, error);
                // Continue with other images even if one fails
                return null;
              });
          });
          
          await Promise.all(uploadPromises);
          console.log("All images uploaded successfully");
        } catch (uploadError) {
          console.error("Error during image upload:", uploadError);
          // Continue with navigation even if image upload fails
        }
      }
      
      // Upload image URLs
      if (formData.image_urls.length > 0) {
        console.log(`Uploading ${formData.image_urls.length} image URLs for listing ${listingId}`);
        try {
          const uploadPromises = formData.image_urls.map((imageUrl, index) => {
            console.log(`[${index}] Preparing to upload URL: ${imageUrl}`);
            return listingService.uploadImageUrl(listingId, imageUrl)
              .then(response => {
                console.log(`[${index}] Successfully uploaded URL: ${imageUrl}`, response);
                // If no main image set yet and this is the first URL image, make it main
                if (index === 0 && response && response.id && !mainImageSet) {
                  console.log(`Setting URL image [${index}] as main image, ID: ${response.id}`);
                  mainImageSet = true;
                  return listingService.setMainImage(listingId, response.id);
                }
              })
              .catch(error => {
                console.error(`Error uploading image URL ${index} (${imageUrl}):`, error);
                return null;
              });
          });
          
          await Promise.all(uploadPromises);
          console.log("All image URLs uploaded successfully");
        } catch (uploadError) {
          console.error("Error during image URL upload:", uploadError);
        }
      }
      
      // 3. Перенаправляем на страницу объявления
      console.log(`Redirecting to /product/${listingId}`);
      
      // Show success message
      alert("Объявление успешно создано!");
      
      // Use timeout to ensure the alert is seen before navigation
      setTimeout(() => {
        navigate(`/product/${listingId}`);
      }, 500);
    } catch (err) {
      console.error('Error creating listing:', err);
      setGlobalError('Произошла ошибка при создании объявления. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Редирект происходит в useEffect
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Создать объявление</h1>
          <p className={styles.subtitle}>Заполните информацию о вашей мебели</p>
        </div>
        
        {globalError && (
          <div className={styles.globalError}>
            <p>{globalError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Основная информация</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>Название*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="Например: Кожаный диван в отличном состоянии"
              />
              {errors.title && <p className={styles.errorText}>{errors.title}</p>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>Описание*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                placeholder="Опишите состояние, размеры, материал, цвет и другие особенности товара"
                rows={5}
                style={{ 
                  maxWidth: '100%',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              {errors.description && <p className={styles.errorText}>{errors.description}</p>}
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>Цена (₽)*</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                  placeholder="Например: 15000"
                />
                {errors.price && <p className={styles.errorText}>{errors.price}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>Категория*</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category && <p className={styles.errorText}>{errors.category}</p>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="location" className={styles.label}>Местоположение*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                  placeholder="Город, район"
                />
                {errors.location && <p className={styles.errorText}>{errors.location}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="condition" className={styles.label}>Состояние</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Фотографии</h2>
            <p className={styles.photoInfo}>Добавьте до 10 фотографий. Первая фотография будет главной.</p>
            
            <div className={styles.photoUploadInfo}>
              <p className={styles.photoUploadWarning}>
                Загрузка фото временно недоступна, прикрепляйте ссылку на фотографию
              </p>
              
              <div className={styles.imageUrlInput}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Вставьте ссылку на изображение"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
                <button 
                  type="button" 
                  className={styles.addUrlButton}
                  onClick={handleAddImageUrl}
                >
                  Добавить
                </button>
              </div>
            </div>
            
            <div className={styles.photoUpload}>
              <div className={styles.photoGrid}>
                {previewImages.map((url, index) => {
                  const isFileImage = index < formData.images.length;
                  const urlIndex = !isFileImage ? index - formData.images.length : -1;
                  
                  return (
                    <div key={index} className={styles.photoPreview}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button" 
                        className={styles.removePhoto}
                        onClick={() => isFileImage ? removeImage(index) : removeImageUrl(urlIndex)}
                      >
                        ✕
                      </button>
                      {index === 0 && <span className={styles.mainPhoto}>Главное фото</span>}
                    </div>
                  );
                })}
                
                {(formData.images.length + formData.image_urls.length) < 10 && (
                  <label className={`${styles.addPhotoButton} ${isUploading ? styles.uploading : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <span className={styles.spinnerIcon}>⟳</span>
                        <span>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        <span>Добавить фото</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              {errors.images && <p className={styles.errorText}>{errors.images}</p>}
            </div>
          </div>
          
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать объявление'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateListing; 