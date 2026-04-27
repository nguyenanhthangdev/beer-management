import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import StatisticsDashboard from "./StatisticsDashboard";
import "./index.css";

const API = `${process.env.REACT_APP_API}/statistics`;

function App() {
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("table");

  const formatVND = (number) => {
    if (!number) return "0 VND";
    return number.toLocaleString("vi-VN") + " VND";
  };

  useEffect(() => {
    loadTables();
    loadProducts();
  }, []);

  const toggleServed = async (item) => {
    await axios.put(
      `${API}/order-items/${item.id}/served?served=${!item.served}`,
    );
    loadOrderItems(orderId);
  };

  const loadTables = async () => {
    const res = await axios.get(`${API}/tables`);
    setTables(res.data);
  };

  const loadProducts = async () => {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
  };

  const openTable = async (table) => {
    if (!table?.id) return;

    const res = await axios.post(`${API}/orders/open/${table.id}`);
    setSelectedTable(table);
    setOrderId(res.data.id);
    loadOrderItems(res.data.id);
  };

  const loadOrderItems = async (orderId) => {
    const res = await axios.get(`${API}/order-items/${orderId}`);
    setOrderItems(res.data);

    const totalRes = await axios.get(`${API}/order-items/${orderId}/total`);
    setTotal(totalRes.data);
  };

  const addItem = async (product) => {
    if (!orderId) return;

    await axios.post(`${API}/order-items`, {
      orderId: orderId,
      productId: product.id,
      quantity: 1,
    });

    loadOrderItems(orderId);
  };

  const deleteItem = async (itemId) => {
    const result = await Swal.fire({
      title: "Xóa món?",
      text: "Bạn có chắc muốn xóa món này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await axios.delete(`${API}/order-items/${itemId}`);
      loadOrderItems(orderId);

      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  // ➕ Thêm bàn
  const addTable = async () => {
    const { value: name } = await Swal.fire({
      title: "Thêm bàn",
      input: "text",
      inputPlaceholder: "VD: Bàn 10",
      showCancelButton: true,
    });

    if (name) {
      await axios.post(`${API}/tables`, { name });
      loadTables();
    }
  };

  // ✏️ Sửa bàn
  const editTable = async (table) => {
    const { value: name } = await Swal.fire({
      title: "Sửa bàn",
      input: "text",
      inputValue: table.name,
      showCancelButton: true,
    });

    if (name) {
      await axios.put(`${API}/tables/${table.id}`, { name });
      loadTables();
    }
  };

  // ❌ Xoá bàn
  const deleteTable = async (table) => {
    const result = await Swal.fire({
      title: "Xóa bàn?",
      text: table.name,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/tables/${table.id}`);
        loadTables();

        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Không thể xóa",
          text: err.response?.data || "Bàn đang có khách!",
        });
      }
    }
  };

  // ➕ Thêm món
  const addProduct = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Thêm món",
      html:
        '<input id="name" class="swal2-input" placeholder="Tên món">' +
        '<input id="price" class="swal2-input" placeholder="Giá">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById("name").value,
          price: document.getElementById("price").value,
        };
      },
    });

    if (formValues) {
      await axios.post(`${API}/products`, {
        name: formValues.name,
        price: Number(formValues.price),
      });
      loadProducts();
    }
  };

  // ✏️ Sửa món
  const editProduct = async (p) => {
    const { value: formValues } = await Swal.fire({
      title: "Sửa món",
      html:
        `<input id="name" class="swal2-input" value="${p.name}">` +
        `<input id="price" class="swal2-input" value="${p.price}">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById("name").value,
          price: document.getElementById("price").value,
        };
      },
    });

    if (formValues) {
      await axios.put(`${API}/products/${p.id}`, {
        name: formValues.name,
        price: Number(formValues.price),
      });
      loadProducts();
    }
  };

  // ❌ Xoá món
  const deleteProduct = async (p) => {
    const result = await Swal.fire({
      title: "Xóa món?",
      text: p.name,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      await axios.delete(`${API}/products/${p.id}`);
      loadProducts();
    }
  };

  const pay = async () => {
    await axios.post(`${API}/orders/close/${orderId}`);
    setSelectedTable(null);
    setOrderItems([]);
    setTotal(0);
    loadTables();
  };

  if (view === "stats") {
    return <StatisticsDashboard onBack={() => setView("table")} />;
  }

  // ================= UI =================

  return (
    <div style={{ padding: 20, background: "#f4f4f4", minHeight: "100vh" }}>
      {!selectedTable ? (
        <>
          <h2 style={{ marginBottom: 20 }}>🍺 Danh sách bàn</h2>

          <button onClick={addTable} style={{ marginBottom: 15 }}>
            ➕ Thêm bàn
          </button>

          <button
            onClick={() => setView("stats")}
            style={{ marginBottom: 15 }}
          >
            📊 Thống kê
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
            {(tables || []).map((t) => (
              <div
                key={t.id}
                style={{
                  width: 140,
                  borderRadius: 12,
                  background: t.status === "USING" ? "#ff4d4f" : "#52c41a",
                  color: "white",
                  padding: 10,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  onClick={() => openTable(t)}
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                  {t.name}
                </div>

                <div style={{ fontSize: 12 }}>
                  {t.status === "USING" ? "Đang dùng" : "Trống"}
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
                  <button onClick={() => editTable(t)}>✏️</button>
                  <button onClick={() => deleteTable(t)}>❌</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2>🍻 {selectedTable.name}</h2>

          {/* MENU */}
          <h3 style={{ marginTop: 20 }}>Menu</h3>

          <button onClick={addProduct} style={{ marginBottom: 10 }}>
            ➕ Thêm món
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(products || []).map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#faad14",
                  padding: 10,
                  borderRadius: 10,
                  minWidth: 130,
                }}
              >
                <div onClick={() => addItem(p)} style={{ cursor: "pointer" }}>
                  <b>{p.name}</b>
                  <br />
                  {formatVND(p.price)}
                </div>

                <div style={{ marginTop: 5, display: "flex", gap: 5 }}>
                  <button onClick={() => editProduct(p)}>✏️</button>
                  <button onClick={() => deleteProduct(p)}>❌</button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER */}
          <h3 style={{ marginTop: 20 }}>🧾 Món đã gọi</h3>
          <div style={{ background: "white", borderRadius: 10 }}>
            {(orderItems || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 10,
                  marginBottom: 5,
                  borderRadius: 8,
                  background: item.served ? "#d4edda" : "#f8d7da", // xanh / đỏ
                }}
              >
                <span>
                  {item.productName} x {item.quantity}
                </span>

                <div style={{ display: "flex", gap: 10 }}>
                  {/* NÚT XÁC NHẬN */}
                  <button onClick={() => toggleServed(item)}>
                    {item.served ? "✔ Đã mang" : "🚚 Mang ra"}
                  </button>

                  {/* NÚT XOÁ */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={item.served}
                    style={{
                      background: item.served ? "#ccc" : "#ff4d4f",
                      cursor: item.served ? "not-allowed" : "pointer",
                    }}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: "#000",
              color: "#ffd700",
              fontSize: 20,
              fontWeight: "bold",
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            Tổng tiền: {formatVND(total)}
          </div>

          {/* BUTTON */}
          <button
            onClick={pay}
            style={{
              marginTop: 15,
              width: "100%",
              padding: 15,
              background: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Thanh toán
          </button>
        </>
      )}
    </div>
  );
}

export default App;
