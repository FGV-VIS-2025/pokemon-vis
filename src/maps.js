const regions = [
    "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"
]

// Largura X Altura
const dimensions = {
    "Kanto": [200, 160],
    "Johto": [166, 144],
    "Hoenn": [306, 221],
    "Sinnoh": [216, 168],
    "Unova": [256, 168],
    "Kalos": [320, 210]
}

const regionLocations = {
    "Kanto": `
<area shape="rect" coords="47, 112, 56, 103" title="Pallet Town">
<area shape="rect" coords="47, 92, 56, 76" title="Viridian City">
<area shape="rect" coords="47, 64, 56, 71" title="Viridian Forest">
<area shape="rect" coords="47, 62, 56, 46" title="Pewter City">
<area shape="rect" coords="47, 47, 62, 56" title="Pewter City">
<area shape="rect" coords="88, 39, 96, 48" title="Mt. Moon">
<area shape="rect" coords="127, 39, 137, 48" title="Cerulean City">
<area shape="rect" coords="160, 40, 168, 47" title="Rock Tunnel">
<area shape="rect" coords="160, 50, 168, 57" title="Power Plant">
<area shape="rect" coords="160, 64, 168, 71" title="Lavender Town">
<area shape="rect" coords="168, 74, 176, 82" title="Pokémon Tower">
<area shape="rect" coords="124, 62, 138, 76" title="Saffron City">
<area shape="rect" coords="104, 64, 111, 72" title="Celadon City">
<area shape="rect" coords="128, 88, 136, 96" title="Vermilion City">
<area shape="rect" coords="136, 88, 144, 96" title="Diglett's Cave">
<area shape="rect" coords="112, 112, 120, 120" title="Fuchsia City">
<area shape="rect" coords="75, 128, 88, 135" title="Seafoam Islands">
<area shape="rect" coords="47, 128, 55, 136" title="Cinnabar Island">
<area shape="rect" coords="23, 55, 31, 48" title="Victory Road">
<area shape="rect" coords="23, 39, 31, 47" title="Indigo Plateau">
<area shape="rect" coords="2, 109, 10, 116" title="Tohjo Falls">
<area shape="rect" coords="0, 80, 8, 88" title="Mt. Silver (Johto)">
<area shape="rect" coords="47, 103, 56, 92" title="Route 1">
<area shape="rect" coords="47, 76, 56, 71" title="Route 2">
<area shape="rect" coords="63, 47, 88, 56" title="Route 3">
<area shape="rect" coords="79, 39, 88, 48" title="Route 4">
<area shape="rect" coords="95, 39, 128, 48" title="Route 4">
<area shape="rect" coords="127, 48, 137, 61" title="Route 5">
<area shape="rect" coords="127, 77, 137, 88" title="Route 6">
<area shape="rect" coords="139, 63, 159, 72" title="Route 7">
<area shape="rect" coords="112, 63, 123, 72" title="Route 8">
<area shape="rect" coords="136, 39, 159, 48" title="Route 9">
<area shape="rect" coords="159, 39, 168, 64" title="Route 10">
<area shape="rect" coords="144, 87, 159, 96" title="Route 11">
<area shape="rect" coords="159, 72, 168, 104" title="Route 12">
<area shape="rect" coords="143, 103, 168, 112" title="Route 13">
<area shape="rect" coords="135, 103, 145, 120" title="Route 14">
<area shape="rect" coords="120, 111, 135, 120" title="Route 15">
<area shape="rect" coords="71, 63, 103, 72" title="Route 16">
<area shape="rect" coords="71, 72, 80, 112" title="Route 17">
<area shape="rect" coords="71, 111, 112, 120" title="Route 18">
<area shape="rect" coords="111, 120, 121, 136" title="Route 19">
<area shape="rect" coords="55, 127, 111, 137" title="Route 20">
<area shape="rect" coords="47, 127, 56, 112" title="Route 21">
<area shape="rect" coords="48, 79, 31, 88" title="Route 22">
<area shape="rect" coords="22, 55, 32, 79" title="Route 23">
<area shape="rect" coords="127, 40, 136, 23" title="Route 24">
<area shape="rect" coords="136, 23, 152, 33" title="Route 25">
<area shape="rect" coords="0, 103, 32, 118" title="Route 27">
<area shape="rect" coords="22, 88, 32, 108" title="Route 26">
<area shape="rect" coords="8, 79, 23, 88" title="Route 28">
`,
    "Johto": `
<area shape="rect" coords="144, 109, 152, 117" title="New Bark Town">
<area shape="rect" coords="105, 109, 113, 117" title="Cherrygrove City">
<area shape="rect" coords="90, 60, 97, 68" title="Violet City">
<area shape="rect" coords="116, 60, 136, 69" title="Dark Cave">
<area shape="rect" coords="81, 76, 89, 84" title="Ruins of Alph">
<area shape="rect" coords="90, 129, 98, 137" title="Union Cave">
<area shape="rect" coords="71, 129, 79, 137" title="Azalea Town">
<area shape="rect" coords="53, 129, 61, 137" title="Ilex Forest">
<area shape="rect" coords="49, 88, 63, 103" title="Goldenrod City">
<area shape="rect" coords="53, 60, 61, 68" title="National Park">
<area shape="rect" coords="66, 40, 81, 48" title="Ecruteak City">
<area shape="rect" coords="71, 40, 81, 48" title="Ecruteak City">
<area shape="rect" coords="18, 53, 33, 61" title="Olivine City">
<area shape="rect" coords="18, 88, 26, 96" title="Whirl Islands">
<area shape="rect" coords="8, 96, 16, 104" title="Cianwood City">
<area shape="rect" coords="86, 40, 94, 48" title="Mt. Mortar">
<area shape="rect" coords="109, 40, 117, 48" title="Mahogany Town">
<area shape="rect" coords="109, 7, 117, 15" title="Lake of Rage">
<area shape="rect" coords="129, 40, 137, 48" title="Ice Path">
<area shape="rect" coords="137, 40, 145, 48" title="Blackthorn City">
<area shape="rect" coords="137, 30, 145, 38" title="Dragon's Den">
<area shape="rect" coords="158, 80, 166, 88" title="Mt. Silver">
<area shape="rect" coords="161, 109, 166, 115" title="Tohjo Falls (Kanto)">
<area shape="rect" coords="0, 93, 5, 101" title="Safari Zone">
<area shape="rect" coords="10, 51, 18, 59" title="Battle Frontier">
<area shape="rect" coords="152, 108, 161, 117" title="Route 26 (Kanto)">


<area shape="rect" coords="113, 108, 143, 118" title="Route 29">
<area shape="rect" coords="105, 108, 116, 68" title="Route 30">
<area shape="rect" coords="98, 59, 115, 68" title="Route 31">
<area shape="rect" coords="89, 68, 99, 128" title="Route 32">
<area shape="rect" coords="79, 128, 90, 137" title="Route 33">
<area shape="rect" coords="52, 103, 62, 128" title="Route 34">
<area shape="rect" coords="52, 68, 62, 88" title="Route 35">
<area shape="rect" coords="60, 59, 89, 69" title="Route 36">
<area shape="rect" coords="71, 55, 82, 58" title="Route 37">
<area shape="rect" coords="25, 39, 66, 49" title="Route 38">
<area shape="rect" coords="25, 48, 34, 53" title="Route 39">
<area shape="rect" coords="17, 61, 27, 82" title="Route 40">
<area shape="rect" coords="17, 82, 27, 105" title="Route 41">
<area shape="rect" coords="81, 39, 109, 49" title="Route 42">
<area shape="rect" coords="108, 15, 118, 40" title="Route 43">
<area shape="rect" coords="117, 39, 128, 49" title="Route 44">
<area shape="rect" coords="136, 48, 146, 89" title="Route 45">
<area shape="rect" coords="130, 78, 140, 108" title="Route 46">
<area shape="rect" coords="0, 104, 8, 111" title="Route 47">
<area shape="rect" coords="0, 100, 6, 105" title="Route 48">
`,

    "Hoenn": `
<area shape="rect" coords="57, 147, 65, 155" title="Littleroot Town">
<area shape="rect" coords="57, 122, 65, 129" title="Oldale Town">
<area shape="rect" coords="30, 122, 45, 130" title="Petalburg City">
<area shape="rect" coords="11, 82, 26, 90" title="Rustboro City">
<area shape="rect" coords="11, 82, 19, 97" title="Rustboro City">
<area shape="rect" coords="38, 185, 46, 193" title="Dewford Town">
<area shape="rect" coords="85, 140, 100, 155" title="Slateport City">
<area shape="rect" coords="85, 89, 99, 96" title="Mauville City">
<area shape="rect" coords="85, 89, 93, 104" title="Mauville City">
<area shape="rect" coords="57, 89, 65, 97" title="Verdanturf Town">
<area shape="rect" coords="64, 64, 72, 72" title="Lavaridge Town">
<area shape="rect" coords="44, 43, 59, 51" title="Fallarbor Town">
<area shape="rect" coords="109, 43, 117, 51" title="Fortree City">
<area shape="rect" coords="156, 61, 171, 76" title="Lilycove City">
<area shape="rect" coords="172, 147, 180, 155" title="Pacifidlog Town">
<area shape="rect" coords="199, 109, 207, 117" title="Sootopolis City">
<area shape="rect" coords="227, 79, 242, 87" title="Mossdeep City">
<area shape="rect" coords="268, 130, 276, 144" title="Evergrande City">
<area shape="rect" coords="221, 174, 237, 191" title="Battle Frontier">
<area shape="rect" coords="268, 196, 280, 208" title="Southern Island">



<area shape="rect" coords="57, 130, 65, 147" title="Route 101">
<area shape="rect" coords="45, 122, 57, 130" title="Route 102">
<area shape="rect" coords="57, 115, 85, 123" title="Route 103">
<area shape="rect" coords="11, 122, 29, 129" title="Route 104">
<area shape="rect" coords="11, 122, 19, 97" title="Route 104">
<area shape="rect" coords="11, 129, 19, 177" title="Route 105">
<area shape="rect" coords="11, 177, 46, 185" title="Route 106">
<area shape="rect" coords="46, 186, 61, 192" title="Route 107">
<area shape="rect" coords="61, 186, 85, 192" title="Route 108">
<area shape="rect" coords="85, 155, 93, 193" title="Route 109">
<area shape="rect" coords="85, 104, 93, 140" title="Route 110">
<area shape="rect" coords="85, 43, 93, 89" title="Route 111">
<area shape="rect" coords="72, 64, 85, 72" title="Route 112">
<area shape="rect" coords="59, 43, 85, 51" title="Route 113">
<area shape="rect" coords="27, 43, 44, 51" title="Route 114">
<area shape="rect" coords="27, 43, 35, 63" title="Route 114">
<area shape="rect" coords="18, 55, 27, 63" title="Meteor Falls">
<area shape="rect" coords="11, 55, 19, 82" title="Route 115">
<area shape="rect" coords="26, 82, 65, 90" title="Route 116">
<area shape="rect" coords="65, 89, 85, 97" title="Route 117">
<area shape="rect" coords="99, 89, 112, 97" title="Route 118">
<area shape="rect" coords="100, 43, 108, 89" title="Route 119">
<area shape="rect" coords="118, 43, 125, 69" title="Route 120">
<area shape="rect" coords="126, 61, 156, 70" title="Route 121">
<area shape="rect" coords="142, 69, 149, 89" title="Route 122">
<area shape="rect" coords="112, 89, 150, 97" title="Route 123">
<area shape="rect" coords="171, 61, 227, 69" title="Route 124">
<area shape="rect" coords="183, 69, 227, 86" title="Route 124">
<area shape="rect" coords="227, 61, 242, 79" title="Route 125">
<area shape="rect" coords="183, 86, 223, 134" title="Route 126">
<area shape="rect" coords="223, 86, 241, 136" title="Route 127">
<area shape="rect" coords="223, 136, 268, 144" title="Route 128">
<area shape="rect" coords="222, 144, 242, 155" title="Route 129">
<area shape="rect" coords="204, 147, 222, 155" title="Route 130">
<area shape="rect" coords="180, 147, 204, 155" title="Route 131">
<area shape="rect" coords="153, 147, 172, 155" title="Route 132">
<area shape="rect" coords="131, 147, 153, 155" title="Route 133">
<area shape="rect" coords="100, 147, 131, 155" title="Route 134">
`,
    "Sinnoh": `
<area shape="rect" coords="22, 150, 30, 158" title="Twinleaf Town">
<area shape="rect" coords="8, 136, 23, 151" title="Lake Verity">
<area shape="rect" coords="36, 143, 44, 151" title="Sandgem Town">
<area shape="rect" coords="29, 122, 44, 137" title="Jubilife City">
<area shape="rect" coords="8, 115, 16, 130" title="Canalave City">
<area shape="rect" coords="22, 66, 30, 74" title="Iron Island">
<area shape="rect" coords="16, 17, 24, 25" title="Full Moon Island">
<area shape="rect" coords="29, 17, 37, 25" title="New Moon Island">
<area shape="rect" coords="36, 94, 44, 109" title="Floaroma Town">
<area shape="rect" coords="64, 73, 79, 81" title="Eterna City">
<area shape="rect" coords="64, 73, 72, 88" title="Eterna City">
<area shape="rect" coords="57, 122, 72, 130" title="Oreburgh City">
<area shape="rect" coords="64, 136, 72, 122" title="Oreburgh City">
<area shape="rect" coords="64, 158, 72, 164" title="Pal Park">
<area shape="rect" coords="78, 3, 86, 18" title="Snowpoint City">
<area shape="rect" coords="64, 6, 76, 18" title="Lake Acuity">
<area shape="rect" coords="64, 3, 77, 18" title="Acuity Lakefront">
<area shape="rect" coords="100, 73, 108, 81" title="Celestic Town">
<area shape="rect" coords="99, 108, 114, 123" title="Hearthome City">
<area shape="rect" coords="120, 101, 135, 109" title="Solaceon Town">
<area shape="rect" coords="148, 87, 163, 102" title="Veilstone City">
<area shape="rect" coords="162, 108, 177, 118" title="Sendoff Spring">
<area shape="rect" coords="162, 118, 177, 123" title="Spring Path">
<area shape="rect" coords="148, 122, 159, 136" title="Lake Valor">
<area shape="rect" coords="159, 122, 163, 136" title="Valor Lakefront">
<area shape="rect" coords="183, 122, 198, 137" title="Sunyshore City">
<area shape="rect" coords="183, 88, 191, 94" title="Victory Road">
<area shape="rect" coords="183, 80, 191, 88" title="Pokémon League">
<area shape="rect" coords="134, 52, 149, 60" title="Fight Area">
<area shape="rect" coords="141, 31, 149, 39" title="Survival Area">
<area shape="rect" coords="22, 150, 30, 158" title="Resort Area">
<area shape="rect" coords="141, 45, 145, 52" title="Battle Tower">
<area shape="rect" coords="145, 45, 149, 52" title="Battle Frontier">
<area shape="rect" coords="85, 45, 93, 102" title="Mt. Coronet">
<area shape="rect" coords="78, 94, 86, 123" title="Mt. Coronet">
<area shape="rect" coords="50, 101, 58, 109" title="Valley Windwords">
<area shape="rect" coords="36, 87, 44, 95" title="Fuego Ironworks">
<area shape="rect" coords="43, 73, 58, 88" title="Eterna Forest">
<area shape="rect" coords="197, 10, 205, 68" title="Seabreak Path">
<area shape="rect" coords="197, 2, 205, 10" title="Flower Paradise">
<area shape="rect" coords="162, 10, 170, 16" title="Stark Mountain">



<area shape="rect" coords="23, 143, 36, 151" title="Route 201">
<area shape="rect" coords="36, 137, 44, 143" title="Route 202">
<area shape="rect" coords="44, 122, 57, 130" title="Route 203">
<area shape="rect" coords="36, 109, 44, 122" title="Route 204">
<area shape="rect" coords="44, 87, 52, 109" title="Route 205">
<area shape="rect" coords="57, 73, 64, 81" title="Route 205">
<area shape="rect" coords="64, 88, 72, 115" title="Route 206">
<area shape="rect" coords="64, 115, 79, 123" title="Route 207">
<area shape="rect" coords="85, 115, 99, 123" title="Route 208">
<area shape="rect" coords="114, 115, 128, 123" title="Route 209">
<area shape="rect" coords="120, 109, 128, 123" title="Route 209">
<area shape="rect" coords="120, 73, 128, 101" title="Route 210">
<area shape="rect" coords="108, 73, 128, 81" title="Route 210">
<area shape="rect" coords="79, 73, 101, 81" title="Route 211">
<area shape="rect" coords="99, 123, 107, 151" title="Route 212">
<area shape="rect" coords="99, 143, 127, 151" title="Route 212">
<area shape="rect" coords="142, 136, 163, 151" title="Route 213">
<area shape="rect" coords="155, 102, 163, 123" title="Route 214">
<area shape="rect" coords="127, 87, 148, 95" title="Route 215">
<area shape="rect" coords="64, 45, 86, 53" title="Route 216">
<area shape="rect" coords="64, 17, 72, 45" title="Route 217">
<area shape="rect" coords="16, 122, 29, 130" title="Route 218">
<area shape="rect" coords="36, 151, 44, 158" title="Route 219">
<area shape="rect" coords="36, 157, 52, 165" title="Route 220">
<area shape="rect" coords="52, 157, 72, 165" title="Route 221">
<area shape="rect" coords="162, 129, 183, 137" title="Route 222">
<area shape="rect" coords="183, 94, 191, 122" title="Route 223">
<area shape="rect" coords="190, 73, 198, 88" title="Route 224">
<area shape="rect" coords="197, 68, 205, 81" title="Route 224">
<area shape="rect" coords="134, 31, 142, 52" title="Route 225">
<area shape="rect" coords="149, 31, 170, 39" title="Route 226">
<area shape="rect" coords="162, 16, 170, 32" title="Route 227">
<area shape="rect" coords="169, 31, 177, 53" title="Route 228">
<area shape="rect" coords="169, 52, 184, 60" title="Route 229">
<area shape="rect" coords="149, 52, 169, 60" title="Route 230">
`,
    "Unova": `
<area shape="rect" coords="231, 144, 233, 152" title="Route 1">
<area shape="rect" coords="229, 124, 232, 132" title="Route 2">
<area shape="rect" coords="209, 117, 222, 121" title="Route 3">
<area shape="rect" coords="130, 96, 134, 124" title="Route 4">
<area shape="rect" coords="115, 89, 126, 94" title="Route 5">
<area shape="poly" coords="44,68, 44,73, 68,89, 69,84" title="Route 6">
<area shape="poly" coords="45,64, 44,60, 68,45, 70,48" title="Route 7">
<area shape="rect" coords="80, 41, 94, 47" title="Route 8">
<area shape="rect" coords="113, 41, 127, 47" title="Route 9">
<area shape="rect" coords="134, 29, 158, 34" title="Route 10">
<area shape="rect" coords="138, 41, 151, 47" title="Route 11">
<area shape="rect" coords="170, 41, 184, 47" title="Route 12">
<area shape="poly" coords="195,46, 196,51, 220,67, 219,62" title="Route 13">
<area shape="poly" coords="194,85, 194,90, 220,73, 220,69" title="Route 14">
<area shape="rect" coords="169, 89, 184, 94" title="Route 15">
<area shape="rect" coords="138, 89, 150, 94" title="Route 16">
<area shape="rect" coords="213, 156, 226, 161" title="Route 17">
<area shape="rect" coords="202, 156, 213, 161" title="Route 18">
<area shape="rect" coords="13, 131, 15, 147" title="Route 19">
<area shape="poly" coords="12,132, 12,130, 26,126, 27,130" title="Route 19">

<area shape="rect" coords="39, 126, 63, 130" title="Route 20">
<area shape="rect" coords="233, 41, 237, 50" title="Route 21">
<area shape="rect" coords="211, 35, 229, 39" title="Route 22">
<area shape="rect" coords="195, 35, 205, 39" title="Route 23">
<area shape="rect" coords="195, 15, 197, 39" title="Route 23">
<area shape="rect" coords="188, 15, 197, 19" title="Route 23">
<area shape="rect" coords="229, 66, 253, 71" title="Marine Tube">
<area shape="rect" coords="251, 31, 253, 71" title="Marine Tube">
<area shape="rect" coords="241, 35, 253, 40" title="Marine Tube">



<area shape="poly" coords="138,130, 187,117, 138,126," title="Sky Arrow Bridge">
<area shape="rect" coords="118, 102, 131, 107" title="Desert Resort">
<area shape="rect" coords="93, 40, 114, 46" title="Tubeline Bridge">
<area shape="rect" coords="150, 40, 171, 46" title="Village Bridge">
<area shape="rect" coords="149, 88, 170, 94" title="Marvelous Bridge">
<area shape="rect" coords="80, 88, 114, 94" title="Driftveil Drawbridge">



<area shape="rect" coords="226, 152, 238, 164" title="Nuvema Town">
<area shape="rect" coords="219, 148, 225, 154" title="Plasma Frigate">
<area shape="rect" coords="226, 132, 238, 144" title="Accumula Town">
<area shape="rect" coords="222, 112, 234, 124" title="Striaton City">
<area shape="rect" coords="197, 112, 209, 124" title="Nacrene City">
<area shape="rect" coords="126, 124, 138, 136" title="Castelia City">
<area shape="rect" coords="126, 85, 138, 97" title="Nimbasa City">
<area shape="rect" coords="68, 85, 80, 97" title="Driftveil City">
<area shape="rect" coords="34, 61, 46, 73" title="Mistralton City">
<area shape="rect" coords="68, 37, 80, 49" title="Icirrus City">
<area shape="rect" coords="126, 37, 138, 49" title="Opelucid City">
<area shape="rect" coords="164, 9, 176, 21" title="Pokémon League">
<area shape="rect" coords="184, 37, 196, 49" title="Lacunosa Town">
<area shape="rect" coords="218, 61, 230, 73" title="Undella Town">
<area shape="rect" coords="184, 85, 190, 97" title="Black City">
<area shape="rect" coords="190, 85, 196, 97" title="White Forest">
<area shape="rect" coords="8, 147, 20, 161" title="Aspertia City">
<area shape="rect" coords="26, 121, 39, 135" title="Floccesy Town">
<area shape="rect" coords="63, 121, 76, 135" title="Virbank City">



<area shape="rect" coords="60, 111, 68, 121" title="Pokéwood">
<area shape="rect" coords="38, 115, 44, 121" title="Floccesy Ranch">
<area shape="rect" coords="38, 135, 44, 143" title="Cave of Being">
<area shape="rect" coords="61, 135, 67, 143" title="Virbank Complex">
<area shape="rect" coords="153, 140, 159, 148" title="Castelia Sewers">
<area shape="rect" coords="211, 148, 217, 156" title="P2 Laboratory">
<area shape="rect" coords="102, 115, 108, 123" title="Relic Passage">
<area shape="rect" coords="73, 99, 81, 109" title="PWT">
<area shape="rect" coords="69, 74, 81, 109" title="Clay Tunnel">
<area shape="rect" coords="181, 61, 193, 75" title="Lentimas Town">
<area shape="rect" coords="195, 56, 201, 64" title="Strange House">
<area shape="rect" coords="203, 64, 209, 72" title="Reversal Mountain">
<area shape="rect" coords="232, 50, 238, 56" title="Seaside Cave">
<area shape="rect" coords="229, 30, 241, 41" title="Humilau City">
<area shape="rect" coords="179, 3, 185, 11" title="N's Castle">
<area shape="rect" coords="180, 12, 188, 21" title="Victory Road">

<area shape="rect" coords="236, 115, 242, 121" title="Dreamyard">
<area shape="rect" coords="212, 107, 218, 113" title="Wellspring Cave">
<area shape="rect" coords="191, 122, 197, 128" title="Pinwheel Forest">
<area shape="rect" coords="112, 101, 118, 107" title="Relic Castle">
<area shape="rect" coords="66, 71, 72, 77" title="Mistralton Cave">
<area shape="rect" coords="39, 77, 45, 83" title="Chargestone Cave">
<area shape="rect" coords="51, 47, 57, 53" title="Celestial Tower">
<area shape="rect" coords="69, 52, 75, 58" title="Twist Mountain">
<area shape="rect" coords="63, 28, 69, 34" title="Dragonspiral Tower">
<area shape="rect" coords="85, 33, 91, 39" title="Moor of Icirrus">
<area shape="rect" coords="4, 27, 10, 33" title="Anville Town">
<area shape="rect" coords="114, 46, 120, 52" title="Challenger's Cave">
<area shape="rect" coords="159, 20, 167, 28" title="Victory Road">
<area shape="rect" coords="205, 33, 211, 41" title="Giant Chasm">
<area shape="rect" coords="239, 60, 245, 68" title="Undella Bay">
<area shape="rect" coords="194, 74, 200, 80" title="Abundant Shrine">
<area shape="rect" coords="143, 81, 149, 87" title="Lostlorn Forest">
<area shape="rect" coords="129, 64, 135, 70" title="EntraLink">
<area shape="rect" coords="71, 142, 77, 148" title="Liberty Island">
<area shape="rect" coords="95, 153, 103, 161" title="Unity Tower">
`,
    "Kalos": `
`
}



