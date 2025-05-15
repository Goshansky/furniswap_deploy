import { useState, useEffect } from 'react';
import { Input, Tag, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './InspirationDesign.module.css';

// Типы данных
interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
}

interface InspirationRoom {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  style: string;
  roomType: string;
  products: Product[];
}

const InspirationDesign = () => {
  const [inspirations, setInspirations] = useState<InspirationRoom[]>([]);
  const [filteredInspirations, setFilteredInspirations] = useState<InspirationRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    styles: string[];
    roomTypes: string[];
  }>({
    styles: [],
    roomTypes: []
  });
  const [loading, setLoading] = useState(true);

  // Стили и типы комнат для фильтрации
  const availableStyles = ['Скандинавский', 'Лофт', 'Минимализм', 'Классический', 'Современный'];
  const availableRoomTypes = ['Гостиная', 'Спальня', 'Кухня', 'Детская', 'Кабинет', 'Ванная'];

  // Загрузка демо-данных (в реальном приложении это был бы API запрос)
  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      const demoData: InspirationRoom[] = [
        {
          id: 1,
          title: 'Уютная скандинавская гостиная',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          description: 'Светлая гостиная в скандинавском стиле с минимальным декором и натуральными материалами.',
          style: 'Скандинавский',
          roomType: 'Гостиная',
          products: [
            { id: 101, title: 'Диван Lille', price: 24500, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29mYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 102, title: 'Журнальный столик Oslo', price: 8900, imageUrl: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlJTIwdGFibGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 103, title: 'Торшер Bergen', price: 5600, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zmxvb3IlMjBsYW1wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }
          ]
        },
        {
          id: 2,
          title: 'Лофт-кабинет',
          imageUrl: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhvbWUlMjBvZmZpY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          description: 'Стильный рабочий кабинет в стиле лофт с кирпичной стеной и грубой мебелью из дерева и металла.',
          style: 'Лофт',
          roomType: 'Кабинет',
          products: [
            { id: 201, title: 'Рабочий стол Industrial', price: 18900, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVza3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 202, title: 'Кресло Worker', price: 12400, imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8b2ZmaWNlJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' }
          ]
        },
        {
          id: 3,
          title: 'Минималистичная спальня',
          imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWluaW1hbGlzdCUyMGJlZHJvb218ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          description: 'Спокойная спальня в стиле минимализм с нейтральной цветовой палитрой и функциональной мебелью.',
          style: 'Минимализм',
          roomType: 'Спальня',
          products: [
            { id: 301, title: 'Кровать Zen', price: 32000, imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmVkfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
            { id: 302, title: 'Тумба прикроватная Simple', price: 7800, imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a58d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmFpZ2h0c3RhbmR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 303, title: 'Шкаф Minimal', price: 29500, imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2FyZHJvYmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' }
          ]
        },
        {
          id: 4,
          title: 'Классическая гостиная',
          imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b485390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xhc3NpY2FsJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          description: 'Элегантная гостиная в классическом стиле с деревянной мебелью и традиционным декором.',
          style: 'Классический',
          roomType: 'Гостиная',
          products: [
            { id: 401, title: 'Диван Chesterfield', price: 68000, imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlc3RlcmZpZWxkJTIwc29mYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 402, title: 'Кресло Victoria', price: 25600, imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXJtY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 403, title: 'Столик Antique', price: 18500, imageUrl: 'https://images.unsplash.com/photo-1577141262638-5606e6f0de1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW50aXF1ZSUyMHRhYmxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }
          ]
        },
        {
          id: 5,
          title: 'Современная кухня',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9kZXJuJTIwa2l0Y2hlbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          description: 'Функциональная кухня в современном стиле с гладкими поверхностями и встроенной техникой.',
          style: 'Современный',
          roomType: 'Кухня',
          products: [
            { id: 501, title: 'Обеденный стол Glass', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGluaW5nJTIwdGFibGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' },
            { id: 502, title: 'Стулья Modern (4 шт)', price: 36000, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGluaW5nJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' }
          ]
        }
      ];
      
      setInspirations(demoData);
      setFilteredInspirations(demoData);
      setLoading(false);
    }, 1500);
  }, []);

  // Обработка поиска
  useEffect(() => {
    // Фильтрация по поисковому запросу и активным фильтрам
    let filtered = inspirations;
    
    // Поисковый запрос
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.products.some(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Фильтр по стилю
    if (activeFilters.styles.length > 0) {
      filtered = filtered.filter(item => activeFilters.styles.includes(item.style));
    }
    
    // Фильтр по типу комнаты
    if (activeFilters.roomTypes.length > 0) {
      filtered = filtered.filter(item => activeFilters.roomTypes.includes(item.roomType));
    }
    
    setFilteredInspirations(filtered);
  }, [searchTerm, activeFilters, inspirations]);

  // Обработчики фильтров
  const handleStyleFilter = (style: string) => {
    setActiveFilters(prev => {
      const isSelected = prev.styles.includes(style);
      return {
        ...prev,
        styles: isSelected 
          ? prev.styles.filter(s => s !== style) 
          : [...prev.styles, style]
      };
    });
  };

  const handleRoomTypeFilter = (roomType: string) => {
    setActiveFilters(prev => {
      const isSelected = prev.roomTypes.includes(roomType);
      return {
        ...prev,
        roomTypes: isSelected 
          ? prev.roomTypes.filter(r => r !== roomType) 
          : [...prev.roomTypes, roomType]
      };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ styles: [], roomTypes: [] });
    setSearchTerm('');
  };

  // Обработчик клика по продукту
  const handleProductClick = (productId: number) => {
    // В реальном приложении здесь был бы переход на страницу товара
    window.open(`/product/${productId}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Вдохновение для вашего дома</h1>
          <p className={styles.subtitle}>Найдите идеи для вашего интерьера и воплотите их с помощью подержанной мебели</p>
        </div>

        <div className={styles.searchSection}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Поиск по дизайнам и предметам мебели"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            allowClear
          />
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Стиль интерьера:</h3>
            <div className={styles.filterTags}>
              {availableStyles.map(style => (
                <Tag.CheckableTag
                  key={style}
                  checked={activeFilters.styles.includes(style)}
                  onChange={() => handleStyleFilter(style)}
                  className={styles.filterTag}
                >
                  {style}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Тип комнаты:</h3>
            <div className={styles.filterTags}>
              {availableRoomTypes.map(roomType => (
                <Tag.CheckableTag
                  key={roomType}
                  checked={activeFilters.roomTypes.includes(roomType)}
                  onChange={() => handleRoomTypeFilter(roomType)}
                  className={styles.filterTag}
                >
                  {roomType}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          {(activeFilters.styles.length > 0 || activeFilters.roomTypes.length > 0 || searchTerm) && (
            <button onClick={clearAllFilters} className={styles.clearFiltersBtn}>
              Сбросить все фильтры
            </button>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p>Загружаем вдохновляющие идеи...</p>
          </div>
        ) : filteredInspirations.length === 0 ? (
          <div className={styles.emptyResult}>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска или сбросьте фильтры</p>
            <button onClick={clearAllFilters} className={styles.resetFiltersBtn}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className={styles.inspirationGrid}>
            {filteredInspirations.map(item => (
              <div key={item.id} className={styles.inspirationCard}>
                <div className={styles.inspirationImageContainer}>
                  <img src={item.imageUrl} alt={item.title} className={styles.inspirationImage} />
                  <div className={styles.inspirationTags}>
                    <span className={styles.styleTag}>{item.style}</span>
                    <span className={styles.roomTag}>{item.roomType}</span>
                  </div>
                </div>
                <div className={styles.inspirationContent}>
                  <h2 className={styles.inspirationTitle}>{item.title}</h2>
                  <p className={styles.inspirationDescription}>{item.description}</p>
                  
                  <div className={styles.productsSection}>
                    <h3 className={styles.productsTitle}>Использованная мебель:</h3>
                    <div className={styles.productsGrid}>
                      {item.products.map(product => (
                        <div 
                          key={product.id} 
                          className={styles.productItem}
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className={styles.productImageWrapper}>
                            <img src={product.imageUrl} alt={product.title} className={styles.productImage} />
                          </div>
                          <div className={styles.productInfo}>
                            <h4 className={styles.productTitle}>{product.title}</h4>
                            <p className={styles.productPrice}>{product.price.toLocaleString()} ₽</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default InspirationDesign; 