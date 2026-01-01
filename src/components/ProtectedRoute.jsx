import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { currentUser } = useAuth(); // Assuming useAuth exposes loading state too, but the context I saw earlier doesn't expose it explicitly in the return value, wait.
    // I checked AuthContext.jsx in step 18. It DOES NOT expose `loading`.
    // Wait, line 20: const [loading, setLoading] = useState(true);
    // Line 58: {!loading && children}
    // So the AuthProvider doesn't render children until loading is false.
    // So by the time we are here, loading is done?
    // No, `ProtectedRoute` is a child of `AuthProvider`.
    // The `AuthProvider` blocks rendering of ALL children until initial auth check is done.
    // So `currentUser` will be settled (null or user object).
    // So I don't need to check loading here.

    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
