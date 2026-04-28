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
import "./index.css";

const API = "https://beer-management.onrender.com/api/statistics";

function Dashboard({ onBack }) {
  const [today, setToday] = useState(0);
  const [month, setMonth] = useState(0);
  const [last7Days, setLast7Days] = useState([]);

  const [bestSeller, setBestSeller] = useState([]);
  const [leastSeller, setLeastSeller] = useState([]);
  const [zeroSeller, setZeroSeller] = useState([]);

  const [compareToday, setCompareToday] = useState([]);
  const [compareWeek, setCompareWeek] = useState([]);
  const [compareMonth, setCompareMonth] = useState([]);

  const [date, setDate] = useState("");
  const [customRevenue, setCustomRevenue] = useState(0);

  const [loadingDay, setLoadingDay] = useState(false);
  const [hover, setHover] = useState(false);

  const formatVND = (value) => {
    const num = Number(value);
    if (!value || isNaN(num)) return "0 VND";
    return Math.floor(num).toLocaleString("vi-VN") + " VND";
  };

  console.log("compareToday:", compareToday);
  
  const dateCard = {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    border: "1px solid #eee",
    background: "#fff",
    maxWidth: 400,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const dateInput = {
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
    width: "100%",
    marginTop: 10,
  };

  const resultBox = {
    marginTop: 15,
    padding: 10,
    background: "#f6f8fa",
    borderRadius: 8,
  };

  const loadAll = async () => {
    const t = await axios.get(`${API}/today`);
    setToday(t.data);

    const m = await axios.get(`${API}/month`);
    setMonth(m.data);

    const d7 = await axios.get(`${API}/last-7-days`);

    const full7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      full7Days.push({
        date: d.toLocaleDateString("en-CA"),
        revenue: 0,
      });
    }

    d7.data.forEach((item) => {
      const found = full7Days.find((d) => d.date === item[0]);
      if (found) found.revenue = item[1];
    });

    setLast7Days(
      full7Days.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
      })),
    );

    setCompareToday((await axios.get(`${API}/compare/today`)).data);
    setCompareWeek((await axios.get(`${API}/compare/week`)).data);
    setCompareMonth((await axios.get(`${API}/compare/month`)).data);

    // ================= BEST + LEAST =================
    const res = await axios.get(`${API}/best-seller`);

    const data = res.data.map((i) => ({
      name: i[0],
      quantity: i[1],
    }));

    // ❗ bỏ món chưa bán
    const soldOnly = data.filter((i) => i.quantity > 0);

    // sort giảm dần
    const sorted = [...soldOnly].sort((a, b) => b.quantity - a.quantity);

    // ===== BEST SELLER =====
    let best = [];

    if (sorted.length <= 5) {
      best = sorted;
    } else {
      const top5Value = sorted[4].quantity;
      best = sorted.filter((i) => i.quantity >= top5Value);
    }

    setBestSeller(best);

    // ===== LEAST SELLER =====
    const bestSet = new Set(best.map((i) => i.name));

    const least = sorted
      .filter((i) => !bestSet.has(i.name))
      .sort((a, b) => a.quantity - b.quantity);

    setLeastSeller(least);

    // ================= ZERO SELLER =================
    const zero = await axios.get(`${API}/zero-seller`);
    setZeroSeller(zero.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadByDate = async () => {
    if (!date) return;

    setLoadingDay(true);

    try {
      const res = await axios.get(`${API}/day`, {
        params: { date },
      });

      // giả delay nhẹ cho mượt (optional)
      setTimeout(() => {
        setCustomRevenue(res.data);
        setLoadingDay(false);
      }, 800);
    } catch (err) {
      setLoadingDay(false);
    }
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

        <div style={{ fontSize: 18 }}>
          {label1}: <b>{formatVND(current)}</b>
        </div>

        <div style={{ color: "#666" }}>
          {label2}: {formatVND(prev)}
        </div>

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
    <div style={{ padding: 30, background: "#fff", minHeight: "100vh" }}>
      <button onClick={onBack}>⬅ Quay lại</button>

      <h1>📊 Dashboard quán</h1>

      {/* CARD */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={card}>
          Hôm nay <br /> <b>{formatVND(today)}</b>
        </div>
        <div style={card}>
          Tháng này <br /> <b>{formatVND(month)}</b>
        </div>
      </div>

      {/* SO SÁNH */}
      <h3>📈 So sánh</h3>

console.log("compareToday:", compareToday);
      <CompareItem
        title="Hôm nay vs hôm qua"
        current={compareToday?.[0] || 0}
        prev={compareToday?.[1] || 0}
        label1="Hôm nay"
        label2="Hôm qua"
      />

      <CompareItem
        title="Tuần này vs tuần trước"
        current={compareWeek?.[0] || 0}
        prev={compareWeek?.[1] || 0}
        label1="Tuần này"
        label2="Tuần trước"
      />

      <CompareItem
        title="Tháng này vs tháng trước"
        current={compareMonth?.[0] || 0}
        prev={compareMonth?.[1] || 0}
        label1="Tháng này"
        label2="Tháng trước"
      />

      {/* 7 NGÀY */}
      <h3>📅 7 ngày gần nhất</h3>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          <LineChart width="100%" height={400} data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="revenue" strokeWidth={2} />
          </LineChart>
        </div>
      </div>

      {/* BEST SELLER */}
      <h3>🔥 Best Seller</h3>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 600 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={bestSeller}>
              <XAxis
                dataKey="name"
                interval={0}
                tickFormatter={(name) =>
                  name.length > 10 ? name.substring(0, 10) + "..." : name
                }
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LEAST SELLER */}

      <h3 style={{ marginTop: 30 }}>❄️ Món bán ít</h3>

      <div
        style={{
          background: "#fafafa",
          borderRadius: 12,
          padding: 15,
          border: "1px solid #eee",
          maxWidth: "100%",
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

      {/* ZERO */}
      <h3 style={{ marginTop: 30 }}>❄️ Món chưa bán</h3>

      <div
        style={{
          background: "#fafafa",
          padding: 15,
          borderRadius: 10,
          border: "1px solid #eee",
          maxWidth: "100%",
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

      {/* DATE */}
      <div style={dateCard}>
        <h3>📅 Doanh thu theo ngày</h3>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={dateInput}
        />

        <button
          onClick={loadByDate}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: hover ? "#40a9ff" : "#1890ff",
            color: "#fff",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Xem doanh thu
        </button>

        <div style={resultBox}>
          <div style={{ fontSize: 18, marginTop: 10 }}>💰 Doanh thu:</div>

          <div style={{ marginTop: 15 }}>
            {loadingDay ? (
              <div style={{ textAlign: "center" }}>
                <div className="spinner" />
                <div>Đang tính toán...</div>
              </div>
            ) : (
              <div
                style={{ fontSize: 26, fontWeight: "bold", color: "#1890ff" }}
              >
                {formatVND(customRevenue)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  padding: 20,
  border: "1px solid #ddd",
  borderRadius: 10,
  width: 200,
};

export default Dashboard;
