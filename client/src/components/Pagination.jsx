import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

  return (
    <div className="pagination">
      {/* Previous button */}
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>

      {/* Show "..." if there's a gap before the first visible page */}
      {startPage > 1 && <span>...</span>}

      {/* Page number buttons */}
      {[...Array(endPage - startPage + 1)].map((_, index) => {
        const page = startPage + index;
        return (
          <button
            key={page}
            className={currentPage === page ? 'active' : ''}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}

      {/* Show "..." if there's a gap after the last visible page */}
      {endPage < totalPages && <span>...</span>}

      {/* Next button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages}
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;
