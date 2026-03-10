<?php
include 'koneksi.php';

$nim = $_POST['nim'];

$query = mysqli_query($conn, "SELECT * FROM mahasiswa WHERE nim='$nim'");

$data = mysqli_fetch_assoc($query);

if($data){
    header("Location: penilaian.php?nim=$nim");
}else{
    echo "NIM tidak ditemukan";
}
?>