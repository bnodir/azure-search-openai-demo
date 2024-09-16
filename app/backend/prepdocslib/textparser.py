import re
from typing import IO, AsyncGenerator

from charset_normalizer import from_bytes

from .page import Page
from .parser import Parser


def cleanup_data(data: str) -> str:
    """Cleans up the given content using regexes
    Args:
        data: (str): The data to clean up.
    Returns:
        str: The cleaned up data.
    """
    # match two or more newlines and replace them with one new line
    output = re.sub(r"\n{2,}", "\n", data)
    # match two or more spaces that are not newlines and replace them with one space
    output = re.sub(r"[^\S\n]{2,}", " ", output)

    return output.strip()


class TextParser(Parser):
    """Parses simple text into a Page object."""

    async def parse(self, content: IO) -> AsyncGenerator[Page, None]:
        # read the content
        data = content.read()

        # detect the encoding
        result = from_bytes(data).best()
        encoding = result.encoding if result else None

        if encoding is None:
            raise ValueError("Unable to detect encoding for the file content")

        # decode the content using the detected encoding
        decoded_data = data.decode(encoding)
        text = cleanup_data(decoded_data)
        yield Page(0, 0, text=text)
