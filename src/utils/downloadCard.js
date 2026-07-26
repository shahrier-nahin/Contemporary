import html2canvas from "html2canvas";

async function renderCard(id = "export-card") {

  const element = document.getElementById(id);

  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  return canvas;
}

export async function downloadCard(id = "export-card") {

  const canvas = await renderCard(id);

  const link = document.createElement("a");

  link.download = "card.png";

  link.href = canvas.toDataURL("image/png");

  link.click();

}

export async function getCardBlob(id = "export-card") {

  const canvas = await renderCard(id);

  return new Promise((resolve) => {

    canvas.toBlob(resolve, "image/png");

  });

}