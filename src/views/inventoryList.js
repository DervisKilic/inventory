import React, { useState, useEffect, useRef } from "react"; // Import useRef here
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  margin-bottom: 20px;
  margin-top: 20px;
`;

const SearchInput = styled.input`
  width: 10%;
  padding: 12px 20px;
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
  color: #333;
  &:focus {
    border-color: #009879;
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  min-width: 400px;
  border-radius: 5px 5px 0 0;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
`;

const Th = styled.th`
  background-color: #009879;
  color: #ffffff;
  text-align: left;
  padding: 12px 15px;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #dddddd;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #dddddd;

  &:last-of-type {
    border-bottom: 2px solid #009879;
  }

  &:hover {
    background-color: #f1f1f1;
    cursor: pointer;
  }

  ${({ status }) => {
    switch (status) {
      case "":
        return `
          background-color: #ccffcc; // Green background for available items
        `;
      default:
        return `
          background-color: #ffcccc; // Red background for rented items
        `;
    }
  }}
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
`;

const Button = styled.button`
  padding: 8px 15px;
  background-color: #009879;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Image = styled.img`
  width: 50px;
  height: auto;
  border-radius: 5px;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const AddItemButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #009879;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
`;

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [editableItemId, setEditableItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    serial: "",
    description: "",
    purchasedWithin: "",
    currentOwner: "",
    dateBorrowed: "",
    imagePath: "",
  });
  const fileInputRef = useRef(null); // Define fileInputRef here
  const currentIP = window.location.hostname;

  useEffect(() => {
    fetch(`http://${currentIP}:5000/api/inventory`)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching inventory data:", error));
  }, []);

  const handleFileSelect = (event, itemId) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      handleFileUpload(file, itemId);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value); // Update search query state
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (file, itemId) => {
    const formData = new FormData();
    formData.append("inventoryImage", file);
    formData.append("itemId", itemId); // Pass the itemId to the server

    fetch(`http://${currentIP}:5000/api/uploadImage`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.filePath) {
          const updatedItems = items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                imagePath: `http://${currentIP}:5000/${data.filePath}`,
              };
            }
            return item;
          });
          setItems(updatedItems);
        }
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  const handleEditClick = (id) => {
    setEditableItemId(id);
  };

  const handleDeleteItemClick = async (id) => {
    try {
      const response = await fetch(
        `http://${currentIP}:5000/api/deleteItem/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Remove the deleted item from the items list
        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);
        console.log("Item deleted successfully");
      } else {
        console.error("Failed to delete item.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDoneClick = async (id, e) => {
    e.stopPropagation(); // Stop event propagation here
    if (id === editableItemId) {
      setEditableItemId(null);
      try {
        const response = await fetch(
          `http://${currentIP}:5000/api/updateInventory`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(items), // Send the updated items data
          }
        );
        if (response.ok) {
        } else {
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleInputChange = (event, id, key) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [key]: event.target.value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleAddItemClick = () => {
    // Generate a unique ID for the new item (you can use any method you prefer)
    const newItemId = Math.random().toString(36).substr(2, 9);
    setNewItem({
      ...newItem,
      id: newItemId,
    });
  };

  const handleNewInputChange = (event, key) => {
    setNewItem({
      ...newItem,
      [key]: event.target.value,
    });
  };

  const handleNewDoneClick = async () => {
    // Send the new item data to the backend
    try {
      const response = await fetch(`http://${currentIP}:5000/api/addNewItem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem), // Send the new item data
      });
      if (response.ok) {
        // Add the new item to the items list
        setItems([...items, newItem]);
        // Clear the new item data
        setNewItem({
          id: "",
          name: "",
          serial: "",
          description: "",
          purchasedWithin: "",
          currentOwner: "",
          dateBorrowed: "",
          imagePath: "",
        });
      } else {
        console.error("Failed to add new item.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container>
      <SearchInput
        type="text"
        placeholder="Search by item name..."
        value={searchQuery}
        onChange={handleSearchInputChange}
      />
      <Table>
        <thead>
          <tr>
            <Th>Item Name</Th>
            <Th>Serial/ID</Th>
            <Th>Description</Th>
            <Th>Purchased Within Project/Team</Th>
            <Th>Current Owner / Lended Out To</Th>
            <Th>Date When Borrowed</Th>
            <Th>Image</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <React.Fragment key={item.id}>
              <Tr
                onClick={() => handleEditClick(item.id)}
                status={item.currentOwner === "" ? "" : "rented"}
              >
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleInputChange(e, item.id, "name")}
                    />
                  ) : (
                    item.name
                  )}
                </Td>
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.serial}
                      onChange={(e) => handleInputChange(e, item.id, "serial")}
                    />
                  ) : (
                    item.serial
                  )}
                </Td>
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(e, item.id, "description")
                      }
                    />
                  ) : (
                    item.description
                  )}
                </Td>
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.purchasedWithin}
                      onChange={(e) =>
                        handleInputChange(e, item.id, "purchasedWithin")
                      }
                    />
                  ) : (
                    item.purchasedWithin
                  )}
                </Td>
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.currentOwner}
                      onChange={(e) =>
                        handleInputChange(e, item.id, "currentOwner")
                      }
                    />
                  ) : (
                    item.currentOwner
                  )}
                </Td>
                <Td>
                  {editableItemId === item.id ? (
                    <Input
                      type="text"
                      value={item.dateBorrowed}
                      onChange={(e) =>
                        handleInputChange(e, item.id, "dateBorrowed")
                      }
                    />
                  ) : (
                    item.dateBorrowed
                  )}
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  {editableItemId === item.id ? (
                    <>
                      {/* Edit mode: show upload button or current image with option to change it */}
                      {item.imagePath ? (
                        <Image
                          onClick={() => fileInputRef.current.click()}
                          src={item.imagePath}
                          alt="Item Image"
                        />
                      ) : (
                        <Button onClick={() => fileInputRef.current.click()}>
                          Upload Image
                        </Button>
                      )}
                      <HiddenInput
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e, item.id)}
                        accept="image/*"
                        style={{ display: "" }} // Ensuring input is hidden
                      />
                    </>
                  ) : (
                    <>
                      {/* View mode: only show image if available, otherwise show 'No image' */}
                      {item.imagePath ? (
                        <Image src={item.imagePath} alt="Item Image" />
                      ) : (
                        "No image"
                      )}
                    </>
                  )}
                </Td>
                {editableItemId === item.id && (
                  <Td style={{ textAlign: "center" }}>
                    <Button onClick={(e) => handleDoneClick(item.id, e)}>
                      Save
                    </Button>
                    <Button
                      style={{ marginLeft: "5px" }}
                      onClick={() => handleDeleteItemClick(item.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                )}
              </Tr>
            </React.Fragment>
          ))}
          {/* Render new item row if newItemId is set */}
          {newItem.id && (
            <tr>
              <Td>
                <Input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleNewInputChange(e, "name")}
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  value={newItem.serial}
                  onChange={(e) => handleNewInputChange(e, "serial")}
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => handleNewInputChange(e, "description")}
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  value={newItem.purchasedWithin}
                  onChange={(e) => handleNewInputChange(e, "purchasedWithin")}
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  value={newItem.currentOwner}
                  onChange={(e) => handleNewInputChange(e, "currentOwner")}
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  value={newItem.dateBorrowed}
                  onChange={(e) => handleNewInputChange(e, "dateBorrowed")}
                />
              </Td>
              <Td>
                <Button onClick={() => fileInputRef.current.click()}>
                  Upload Image
                </Button>
                <HiddenInput
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e, newItem.id)}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Td>
              <Td style={{ textAlign: "center" }}>
                <Button onClick={handleNewDoneClick}>Done</Button>
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <AddItemButton onClick={handleAddItemClick}>Add Item</AddItemButton>
    </Container>
  );
};

export default InventoryList;
