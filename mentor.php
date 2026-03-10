<?php
include 'koneksi.php';

$query = mysqli_query($conn, "SELECT * FROM mahasiswa");
?>

<!DOCTYPE html>
<html>
<head>
<title>Daftar Mahasiswa</title>
</head>

<body>

<h2>Daftar Mahasiswa</h2>

<table border="1">
<tr>
<th>NIM</th>
<th>Nama</th>
<th>Aksi</th>
</tr>

<?php while($row = mysqli_fetch_assoc($query)) { ?>

<tr>
<td><?php echo $row['nim']; ?></td>
<td><?php echo $row['nama']; ?></td>
<td>
<a href="penilaian.php?nim=<?php echo $row['nim']; ?>">
Lihat / Nilai
</a>
</td>
</tr>

<?php } ?>

</table>

</body>
</html>