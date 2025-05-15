import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import { User } from '../../services/user.service';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          handleLogout();
        }
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const handleCreateListing = () => {
    if (isAuthenticated) {
      navigate('/create-listing');
    } else {
      navigate('/login', { state: { from: '/create-listing' } });
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navbarBrand}>
          <Link to="/" className={styles.logo}>
            FurniSwap
          </Link>
        </div>

        <div className={styles.navbarMobileToggle} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`${styles.navbarMenu} ${menuOpen ? styles.active : ''}`}>
          <div className={styles.navbarStart}>
            <Link 
              to="/catalog" 
              className={`${styles.navbarItem} ${location.pathname === '/catalog' ? styles.active : ''}`}
            >
              Каталог
            </Link>
            <Link 
              to="/inspiration" 
              className={`${styles.navbarItem} ${location.pathname === '/inspiration' ? styles.active : ''}`}
            >
              Вдохновение
            </Link>
          </div>

          <div className={styles.navbarEnd}>
            <Button 
              type="primary" 
              className={styles.createButton}
              onClick={handleCreateListing}
            >
              Создать объявление
            </Button>

            {isAuthenticated ? (
              <>
                <div className={styles.navbarItemWithDropdown}>
                  <Link 
                    to="/favorites" 
                    className={`${styles.navbarItem} ${location.pathname === '/favorites' ? styles.active : ''}`}
                  >
                    Избранное
                  </Link>
                </div>
                <div className={styles.navbarItemWithDropdown}>
                  <Link 
                    to="/chats" 
                    className={`${styles.navbarItem} ${location.pathname.startsWith('/chats') ? styles.active : ''}`}
                  >
                    Сообщения
                  </Link>
                </div>
                <div className={styles.navbarItemWithDropdown}>
                  <div className={styles.profileTrigger}>
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className={styles.avatarSmall} 
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span>{user?.name || 'Профиль'}</span>
                  </div>
                  <div className={styles.dropdownMenu}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      Мой профиль
                    </Link>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                      Выйти
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`${styles.navbarItem} ${location.pathname === '/login' ? styles.active : ''}`}
                >
                  Войти
                </Link>
                <Link 
                  to="/register" 
                  className={`${styles.navbarItem} ${location.pathname === '/register' ? styles.active : ''}`}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 