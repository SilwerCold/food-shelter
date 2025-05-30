import React from 'react';
import Sidebar from './components/Sidebar';
import MyProducts from './pages/MyProducts';
import theme from './theme';
import ShoppingLists from './pages/ShoppingLists';
import RecipeGenerator from './pages/RecipeGenerator';
import SavedRecipes from './pages/SavedRecipes';

function App() {
  const [page, setPage] = React.useState('products');
  const [products, setProducts] = React.useState([]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.background,
      }}
    >
      <Sidebar onSelect={setPage} activePage={page} />
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          background: theme.background,
        }}
      >
        {page === "products" && <MyProducts products={products} setProducts={setProducts}/>}
        {page === "shopping" && <ShoppingLists products={products} setProducts={setProducts}/>}
        {page === "generator" && <RecipeGenerator />}
        {page === "saved" && <SavedRecipes />}
      </main>
    </div>
  );
}

export default App;
