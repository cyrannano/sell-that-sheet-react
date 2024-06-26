import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, browseDirectory, getCategoryParameters } from 'contexts/AuthContext';
import {
  Box,
  SimpleGrid,
  Tab,
  TabPanel,
  TabPanels,
  TabList,
  Tabs,
  ChakraProvider,
  Select,
} from '@chakra-ui/react';
import { FullFileBrowser, defineFileAction, ChonkyIconName } from 'chonky';
import { useTable, useBlockLayout } from 'react-table';
import Card from 'components/card/Card';
import '@silevis/reactgrid/styles.css';
import { CreateProductModal } from './CreateProductModal';

const AuctionSetCreator = () => {
  const [folderChain, setFolderChain] = useState([{ id: 'root', name: 'Zdjęcia', fc: true }]);
  const [files, setFiles] = useState([]);
  const [categoryParameters, setCategoryParameters] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [usedCategories, setUsedCategories] = useState([null]);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await browseDirectory(folderChain);
      setFiles(files);
    };
    fetchFiles();
  }, [folderChain]);

  useEffect(() => {
    const fetchCategoryParameters = async () => {
      const data = await getCategoryParameters(254699);
      setCategoryParameters(data.parameters);

      const productTemplate = data.parameters.map((param) => [param.id, '']);
      const newProducts = Array.from({ length: 10 }, () => Object.fromEntries(productTemplate));
      setCurrentProducts(newProducts);
    };
    fetchCategoryParameters();
  }, []);

  const columns = useMemo(
    () =>
      categoryParameters.map((param) => ({
        Header: param.name,
        accessor: param.id,
        width: 150,
        Cell: ({ value }) =>
          param.type === 'dictionary' ? (
            <Select value={value} placeholder="Select option">
              {param.dictionary.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.value}
                </option>
              ))}
            </Select>
          ) : (
            value
          ),
      })),
    [categoryParameters]
  );

  const data = useMemo(() => currentProducts, [currentProducts]);

  const updateData = useCallback((rowIndex, columnId, value) => {
    setCurrentProducts((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  }, []);

  const tableInstance = useTable({ columns, data, updateData }, useBlockLayout);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const createProduct = (folderChain, photos) => {
    // Add functionality for creating a product
  };

  const openCreateProductModal = () => {
    setShowCreateProductModal(true);
  };

  const handleFileAction = (action) => {
    switch (action.id) {
      case 'go-up':
        setFolderChain((prev) => prev.slice(0, -1));
        break;
      case 'go-home':
        setFolderChain([{ id: 'root', name: 'Zdjęcia', fc: true }]);
        break;
      case 'open_files':
        if (action.payload.files[0].fc) {
          setFolderChain((prev) => [
            ...prev.slice(0, prev.findIndex((item) => item.id === action.payload.files[0].id)),
            { id: action.payload.files[0].id, name: action.payload.files[0].name, fc: true },
          ]);
        }
        break;
      case 'create_auction_product':
        openCreateProductModal();
        break;
      default:
        break;
    }
  };

  return (
    <Card py="15px">
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        createProductFunction={createProduct}
        folderChain={folderChain}
        photos={[]}
        latestCategories={[]}
        setLatestCategories={() => {}}
      />
      <SimpleGrid spacing={5} minHeight="800px">
        <Tabs overflowX="hidden">
          <TabList>
            {usedCategories.map((category, index) => (
              <Tab key={index}>{category === null ? 'Nowa kategoria' : category.name}</Tab>
            ))}
          </TabList>
          <TabPanels overflowX="scroll">
            {usedCategories.map((_, index) => (
              <TabPanel key={index} p={0} width="100%">
                <ChakraProvider>
                  <Box overflow="auto">
                    <div {...getTableProps()} style={{ display: 'block' }}>
                      <div>
                        {headerGroups.map((headerGroup) => (
                          <div {...headerGroup.getHeaderGroupProps()} style={{ display: 'flex' }}>
                            {headerGroup.headers.map((column) => (
                              <div
                                {...column.getHeaderProps()}
                                style={{ flex: '1 1 150px', display: 'flex' }}
                              >
                                {column.render('Header')}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div {...getTableBodyProps()}>
                        {rows.map((row, i) => {
                          prepareRow(row);
                          return (
                            <div {...row.getRowProps()} style={{ display: 'flex' }}>
                              {row.cells.map((cell) => (
                                <div
                                  {...cell.getCellProps()}
                                  style={{ flex: '1 1 150px', display: 'flex' }}
                                >
                                  {cell.render('Cell', {
                                    updateData: (value) =>
                                      updateData(row.index, cell.column.id, value),
                                  })}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Box>
                </ChakraProvider>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
        <FullFileBrowser
          overflow="hidden"
          files={files}
          folderChain={folderChain}
          onFileAction={handleFileAction}
          fileActions={[
            defineFileAction({
              id: 'create_auction_product',
              hotkeys: ['ctrl+k'],
              button: {
                name: 'Utwórz produkt',
                toolbar: true,
                contextMenu: true,
                icon: ChonkyIconName.database,
                color: 'primary',
              },
              requiresSelection: true,
            }),
          ]}
        />
      </SimpleGrid>
    </Card>
  );
};

export default AuctionSetCreator;
