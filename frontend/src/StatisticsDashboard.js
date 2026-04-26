import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8080/api/statistics";

function Dashboard({ onBack }) {
  const [today, setToday] = useState(0);
  const [month, setMonth] = useState(0);
  const [last7Days, setLast7Days] = useState([]);

  const [bestSeller, setBestSeller] = useState([]);
  const [leastSeller, setLeastSeller] = useState([]);

  const [lowSeller, setLowSeller] = useState([]);
  const [zeroSeller, setZeroSeller] = useState([]);

  const [compareToday, setCompareToday] = useState([]);
  const [compareWeek, setCompareWeek] = useState([]);
  const [compareMonth, setCompareMonth] = useState([]);

  const [date, setDate] = useState("");
  const [customRevenue, setCustomRevenue] = useState(0);

  const formatVND = (value) => {
    const num = Number(value);

    if (!value || isNaN(num)) return "0 VND";

    return Math.floor(num).toLocaleString("vi-VN") + " VND";
  };

  const LineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;

      return (
        <div
          style={{ background: "#fff", padding: 10, border: "1px solid #ccc" }}
        >
          <b>{d.date}</b>
          <div>{formatVND(d.revenue)}</div>
        </div>
      );
    }
    return null;
  };

  // ===== LOAD ALL =====
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const t = await axios.get(`${API}/today`);
    setToday(t.data);

    const m = await axios.get(`${API}/month`);
    setMonth(m.data);

    const d7 = await axios.get(`${API}/last-7-days`);
    const formatDate = (date) => {
      return date.toISOString().slice(5, 10); // MM-DD
    };

    // const today = new Date();

    const full7Days = [];
    const today = new Date();

    // reset giờ để tránh lệch
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); // clone chuẩn
      d.setDate(today.getDate() - i);

      const dateStr = d.toLocaleDateString("en-CA"); // yyyy-MM-dd

      full7Days.push({
        date: dateStr,
        revenue: 0,
      });
    }

    // map data backend
    d7.data.forEach((item) => {
      const backendDate = item[0]; // giữ nguyên yyyy-MM-dd

      const found = full7Days.find((d) => d.date === backendDate);
      if (found) {
        found.revenue = item[1];
      }
    });

    // format lại để hiển thị đẹp
    const finalData = full7Days.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
    }));

    setLast7Days(finalData);

    const best = await axios.get(`${API}/best-seller`);
    setBestSeller(
      best.data.map((i) => ({
        name: i[0],
        quantity: i[1],
      })),
    );

    const data = best.data.map((i) => ({
      name: i[0],
      quantity: i[1],
    }));

    // sort giảm dần
    data.sort((a, b) => b.quantity - a.quantity);

    // lấy mốc top 5
    const top5Value = data[4]?.quantity;

    // giữ lại tất cả món >= top 5 (xử lý đồng hạng)
    const topData = data.filter((i) => i.quantity >= top5Value);

    setBestSeller(topData);

    setCompareToday((await axios.get(`${API}/compare/today`)).data);
    setCompareWeek((await axios.get(`${API}/compare/week`)).data);
    setCompareMonth((await axios.get(`${API}/compare/month`)).data);

    const res = await axios.get(`${API}/best-seller`);

    const dataBestSeller = res.data.map((i) => ({
      name: i[0],
      quantity: i[1],
    }));
    const sorted = [...dataBestSeller].sort((a, b) => b.quantity - a.quantity);
    const top5ValueBestSeller = sorted[4]?.quantity;

    const bestSeller = sorted.filter((i) => i.quantity >= top5ValueBestSeller);

    setBestSeller(bestSeller);

    const bestSet = new Set(bestSeller.map((i) => i.name));

    const leastSeller = sorted
      .filter((i) => i.quantity > 0) // đã bán
      .filter((i) => !bestSet.has(i.name)) // ❌ loại best seller
      .sort((a, b) => a.quantity - b.quantity);

    setLeastSeller(leastSeller);
  };

  const loadByDate = async () => {
    const res = await axios.get(`${API}/day`, {
      params: { date },
    });
    setCustomRevenue(res.data);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;

      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <b>{d.name}</b>
          <div>SL: {d.quantity}</div>
          <div>Doanh thu: {formatVND(d.revenue)}</div>
        </div>
      );
    }
    return null;
  };

  const calcCompare = (current, prev) => {
    const c = Number(current) || 0;
    const p = Number(prev) || 0;

    if (p === 0) {
      return {
        diff: c,
        percent: c > 0 ? 100 : 0,
        isUp: c >= 0,
      };
    }

    const diff = c - p;
    const percent = (diff / p) * 100;

    return {
      diff,
      percent,
      isUp: diff >= 0,
    };
  };

  const CompareItem = ({ title, current, prev, label1, label2 }) => {
    const { diff, percent, isUp } = calcCompare(current || 0, prev || 0);

    useEffect(() => {
      loadZeroSeller();
    }, []);
    const loadZeroSeller = async () => {
      const res = await axios.get(`${API}/zero-seller`);
      setZeroSeller(res.data);
    };

    return (
      <div
        style={{
          padding: 15,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginBottom: 12,
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 5 }}>{title}</div>

        {/* dòng 1 */}
        <div style={{ fontSize: 18 }}>
          {label1}: <b>{formatVND(current)}</b>
        </div>

        {/* dòng 2 */}
        <div style={{ color: "#666" }}>
          {label2}: {formatVND(prev)}
        </div>

        {/* tăng giảm */}
        <div
          style={{
            marginTop: 5,
            color: isUp ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {isUp ? "↑ Tăng" : "↓ Giảm"} {formatVND(Math.abs(diff))} (
          {percent.toFixed(1)}%)
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: 30,
        background: "#fff",
        color: "#000",
        minHeight: "100vh",
      }}
    >
      <button onClick={onBack}>⬅ Quay lại</button>

      <h1>📊 Dashboard quán</h1>

      {/* ===== CARD ===== */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={card}>
          Hôm nay
          <br />
          <b>{formatVND(today)}</b>
        </div>
        <div style={card}>
          Tháng này
          <br />
          <b>{formatVND(month)}</b>
        </div>
      </div>

      {/* ===== SO SÁNH ===== */}
      <h3>📈 So sánh</h3>

      <CompareItem
        title="Hôm nay vs hôm qua"
        current={compareToday?.[0]?.[0] || 0}
        prev={compareToday?.[0]?.[1] || 0}
        label1="Hôm nay"
        label2="Tuần trước"
      />

      <CompareItem
        title="Tuần này vs tuần trước"
        current={compareWeek[0]}
        prev={compareWeek[1]}
        label1="Tuần này"
        label2="Tuần trước"
      />

      <CompareItem
        title="Tháng này vs tháng trước"
        current={compareMonth[0]}
        prev={compareMonth[1]}
        label1="Tháng này"
        label2="Tháng trước"
      />

      {/* ===== 7 NGÀY ===== */}
      <h3 style={{ marginTop: 30 }}>📅 7 ngày gần nhất</h3>
      <LineChart width="100%" height={300} data={last7Days}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={<LineTooltip />} />
        <Line dataKey="revenue" strokeWidth={2} />
      </LineChart>

      {/* ===== BEST SELLER ===== */}
      <h3 style={{ marginTop: 30 }}>🔥 Best Seller</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bestSeller}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="quantity" />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: 30 }}>❄️ Món bán ít</h3>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 15,
          border: "1px solid #eee",
          maxWidth: 500,
        }}
      >
        {leastSeller.length === 0 ? (
          <div style={{ color: "#888" }}>Không có dữ liệu</div>
        ) : (
          leastSeller.slice(0, 10).map((item, index) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span>
                {index + 1}. {item.name}
              </span>

              <span style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                {item.quantity}
              </span>
            </div>
          ))
        )}
      </div>

      <h3 style={{ marginTop: 30 }}>❄️ Món chưa bán</h3>

      <div
        style={{
          background: "#fafafa",
          padding: 15,
          borderRadius: 10,
          border: "1px solid #eee",
          maxWidth: 400,
        }}
      >
        {zeroSeller.length === 0 ? (
          <div>🎉 Không có món nào bị ế</div>
        ) : (
          zeroSeller.map((name, i) => (
            <div
              key={i}
              style={{
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              ⚠️ {name}
            </div>
          ))
        )}
      </div>

      {/* ===== THEO NGÀY ===== */}
      <h3 style={{ marginTop: 30 }}>📅 Doanh thu ngày bất kỳ</h3>
      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <button onClick={loadByDate}>Xem</button>

      <h2>{formatVND(customRevenue)}</h2>
    </div>
  );
}

const card = {
  padding: 20,
  borderRadius: 10,
  border: "1px solid #ddd",
  width: 200,
};

export default Dashboard;
