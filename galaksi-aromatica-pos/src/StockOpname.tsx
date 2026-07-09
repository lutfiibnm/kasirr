import { useState } from "react";

function StockOpname() {

  const [stokSistem, setStokSistem] = useState(0);
  const [stokFisik, setStokFisik] = useState(0);
  const [namaBarang, setNamaBarang] = useState("");

  const selisih = stokFisik - stokSistem;

  let status = "";

  if (selisih < 0) {
    status = "Kekurangan Stok";
  } else if (selisih > 0) {
    status = "Kelebihan Stok";
  } else {
    status = "Stok Sesuai";
  }

  return (
    <div>
      <h2>Stock Opname</h2>

      <label>Nama Barang</label>
      <br />
      <input
        type="text"
        placeholder="Masukkan nama barang"
        value={namaBarang}
        onChange={(e) => setNamaBarang(e.target.value)}
      />

      <br /><br />

      <label>Stok Sistem</label>
      <br />
      <input
        type="number"
        value={stokSistem}
        onChange={(e) =>
          setStokSistem(Number(e.target.value))
        }
      />

      <br /><br />

      <label>Stok Fisik</label>
      <br />
      <input
        type="number"
        value={stokFisik}
        onChange={(e) =>
          setStokFisik(Number(e.target.value))
        }
      />

      <br /><br />

      <h3>Hasil Pemeriksaan</h3>

      <p>
        Barang: {namaBarang}
      </p>

      <p>
        Stok Sistem: {stokSistem}
      </p>

      <p>
        Stok Fisik: {stokFisik}
      </p>

      <p>
        Selisih: {selisih}
      </p>

      <p>
        Status: {status}
      </p>

    </div>
  );
}

export default StockOpname;
