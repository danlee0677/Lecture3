import React from 'react';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Button, Checkbox, TextInput, Container, Stack, Table, Modal, NumberInput } from '@mantine/core'
import { notifications } from '@mantine/notifications';
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

interface Product {
  price: number;
  name: string;
  count: number;
}

interface Products {
  category: string;
  categoryList: Product[];
}

function FilterableProductTable({ products } : { products: Products[] }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <Stack gap="md">
      <SearchBar 
        filterText={filterText} 
        inStockOnly={inStockOnly} 
        setFilterText={setFilterText} 
        setInStockOnly={setInStockOnly} />
      <ProductTable 
        products={products} 
        filterText={filterText}
        inStockOnly={inStockOnly} />
    </Stack>
  );
}

function ProductCategoryRow({ category }: { category: string }) {
  return (
    <Table.Tr>
      <Table.Th>{category}</Table.Th>
    </Table.Tr>
  );
}

function ProductRow({ product }: { product: Product }) {
  const name = (product.count > 0) ? product.name :
    <span style={{ color: 'red' }}>
      {product.name}
    </span>;

  return (
    <Table.Tr>
      <Table.Td>{name}</Table.Td>
      <Table.Td>{`\$${product.price}`}</Table.Td>
      <Table.Td>{`${product.count}`}</Table.Td>
    </Table.Tr>
  );
}

function ProductTable({ products, filterText, inStockOnly }: { products: Products[], filterText: string, inStockOnly: boolean }) {
  const rows: any = [];

  products.forEach((category) => {
    rows.push(
      <ProductCategoryRow 
        category={category["category"]}
        key={category["category"]}/>
    )
    category["categoryList"].forEach((product) => {
      if (
        product.name.toLowerCase().indexOf(
          filterText.toLowerCase()
        ) === -1
      ) {
        return;
      }
      if (inStockOnly && !(product.count > 0)) {
        return;
      }
      rows.push(
        <ProductRow
          product={product}
          key={product.name} />
      );
    })
  });

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Price</Table.Th>
          <Table.Th>Count</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

function SearchBar({
  filterText,
  inStockOnly,
  setFilterText,
  setInStockOnly
}: {
  filterText: string;
  inStockOnly: boolean;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  setInStockOnly: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Stack gap="sm">
      <TextInput value={filterText} placeholder="Search..."
      onChange={(event) => setFilterText(event.currentTarget.value)} />
      <Checkbox label="Only show products in stock" checked={inStockOnly}
      onChange={(event) => setInStockOnly(event.currentTarget.checked)} />
    </Stack>
  );
}

function handleProductAddButtonClick({
  setProductList,
  close,
  newCategory,
  newProductName,
  newProductCount,
  newProductPrice,
  setNewCategory,
  setNewProductName,
  setNewProductCount,
  setNewProductPrice,
}: {
  setProductList: React.Dispatch<React.SetStateAction<Array<Products>>>;
  close: () => void;
  newCategory: string;
  newProductName: string;
  newProductCount: string | number;
  newProductPrice: string | number;
  setNewCategory: React.Dispatch<React.SetStateAction<string>>;
  setNewProductName: React.Dispatch<React.SetStateAction<string>>
  setNewProductCount: React.Dispatch<React.SetStateAction<number|string>>
  setNewProductPrice: React.Dispatch<React.SetStateAction<number|string>>
}) {
  if (newCategory === "") {
    notifications.show({
      title: "Required Fields Missing",
      message: "Missing product category"
    })
  } else if (newProductName === "") {
    notifications.show({
      title: "Required Fields Missing",
      message: "Missing product name"
    })
  } else if (typeof newProductCount === 'string') {
    notifications.show({
      title: "Required Fields Missing",
      message: "Missing product amount"
    })
  } else if (typeof newProductPrice === 'string') {
    notifications.show({
      title: "Required Fields Missing",
      message: "Missing product price"
    })
  } else {
    setProductList((productList) => {
        const found = productList.findIndex((product) => (product["category"] === newCategory));
        if (found === -1) {
          return [...productList, {category: newCategory, categoryList: [{price: newProductPrice, count: newProductCount, name: newProductName}]}];
        } else {
          const idx = productList[found]["categoryList"].findIndex((product) => (product["name"] === newProductName));
          if (idx === -1) {
            return productList.map((category) => 
              category["category"] === newCategory ? {
                ...category, categoryList: [...category["categoryList"], {price: newProductPrice, name: newProductName, count: newProductCount}]
              } : category
            );
          } else {
            return productList.map((category) => category["category"] === newCategory ? {
              category: category["category"], categoryList: category["categoryList"].map((product) => 
                product.name === newProductName ? {
                  ...product, count: product.count + newProductCount
                } : product
              )
            } : category)
          }
        }
    })
    setNewCategory("");
    setNewProductCount("");
    setNewProductName("");
    setNewProductPrice("");
    notifications.clean();
    close();
  }
}

function ProductAddButton({
  productList,
  setProductList
}: {
  productList: Array<Products>;
  setProductList: React.Dispatch<React.SetStateAction<Array<Products>>>;
}) {
  const [opened, {open, close}] = useDisclosure(false);
  const [productCategory, setProductCategory] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState<string|number>("");
  const [productCount, setProductCount] = useState<string|number>('');

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Product" centered>
        <Stack gap="md">
          <TextInput label="Product Category" value={productCategory}
          onChange={(event)=>setProductCategory(event.currentTarget.value)} />

          <TextInput label="New Product Name" value={newProductName}
          onChange={(event)=>setNewProductName(event.currentTarget.value)} />

          <NumberInput label="Amount" value={productCount}
          onChange={setProductCount} />

          <NumberInput label="Price" value={newProductPrice}
          onChange={setNewProductPrice} />
          
          <Button size="xs" onClick={() => {
            handleProductAddButtonClick({
              setProductList: setProductList, 
              close: close, 
              newCategory: productCategory, 
              newProductName: newProductName, 
              newProductCount: productCount, 
              newProductPrice: newProductPrice, 
              setNewCategory: setProductCategory,
              setNewProductCount: setProductCount,
              setNewProductName: setNewProductName,
              setNewProductPrice: setNewProductPrice});
          }}>Done</Button>

        </Stack>
      </Modal>

      <Button size="xs" onClick={open}>
        Add Product
      </Button>
    </>
  )
}

const PRODUCTS: Products[] = 
  [{category: "Fruits", categoryList: [{price: 1, name: "Apple", count: 1},
  {price: 1, name: "Dragonfruit", count: 1},
  {price: 2, name: "Passionfruit", count: 0}]},

  {category: "Vegetables", categoryList: [{price: 2, name: "Spinach", count: 1},
  {price: 4, name: "Pumpkin", count: 0},
  {price: 1, name: "Peas", count: 1}]}
  ];

function App() {
  const [productList, setProductList] = useState(PRODUCTS);
  
  return (
    <Container size="xs" px="md" mt={40}>
      <Stack gap="md">
        <FilterableProductTable products={productList} />
        <ProductAddButton productList={productList} setProductList={setProductList}/>
      </Stack>
    </Container>
  );
}

export default App;
