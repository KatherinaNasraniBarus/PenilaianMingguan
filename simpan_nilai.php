<?php
include 'koneksi.php';

$nim = $_POST['nim'];
$seminar = $_POST['kehadiran_seminar'];
$pua = $_POST['akusisi_pua'];
$bpu = $_POST['akusisi_bpu'];
$sosialisasi = $_POST['jumlah_sosialisasi'];
$video = $_POST['video_viralisasi'];
$admin = $_POST['administrasi'];

$query = "INSERT INTO penilaian VALUES(
'$nim',
'$seminar',
'$pua',
'$bpu',
'$sosialisasi',
'$video',
'$admin'
)";

mysqli_query($conn,$query);

echo "Nilai berhasil disimpan";
?>