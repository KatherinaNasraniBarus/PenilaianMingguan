<?php
include 'koneksi.php';

$nim = $_GET['nim'];

$query = mysqli_query($conn, "SELECT * FROM mahasiswa WHERE nim='$nim'");
$data = mysqli_fetch_assoc($query);
?>

<!DOCTYPE html>
<html>
<head>
<title>Penilaian Mahasiswa</title>
</head>

<body>

<h2>Penilaian Mahasiswa</h2>

<p>Nama: <?php echo $data['nama']; ?></p>
<p>NIM: <?php echo $data['nim']; ?></p>

<form action="simpan_nilai.php" method="POST">

<input type="hidden" name="nim" value="<?php echo $nim; ?>">

<label>Kehadiran Seminar</label>
<input type="number" name="kehadiran_seminar"><br>

<label>Akusisi PUA</label>
<input type="number" name="akusisi_pua"><br>

<label>Akusisi BPU</label>
<input type="number" name="akusisi_bpu"><br>

<label>Jumlah Sosialisasi</label>
<input type="number" name="jumlah_sosialisasi"><br>

<label>Video Viralisasi</label>
<input type="number" name="video_viralisasi"><br>

<label>Administrasi</label>
<input type="number" name="administrasi"><br>

<button type="submit">Simpan Nilai</button>

</form>

</body>
</html>